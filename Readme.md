# Bloggie

A small blog platform built to learn how microservices talk to each other. Posts and comments live in separate services, communicating asynchronously over events instead of direct calls — with the idempotency and consistency problems that comes with, handled deliberately rather than ignored.

## Why this exists

Most tutorials show microservices as a diagram with arrows between boxes. This project was built to work through what actually happens at the seams:

- What should live in its own service, and what's just a route?
- When an event gets delivered twice, what stops your data from drifting?
- How do you keep a read-heavy view (a feed) fast without hammering another service on every request?

Those questions shaped most of the decisions below more than any specific framework choice.

## Architecture

```
┌─────────────────┐         CommentCreated          ┌──────────────────┐
│  Comments        │ ────────────────────────────▶  │  Posts           │
│  Service         │         CommentDeleted          │  Service         │
│                  │ ────────────────────────────▶  │                  │
│  - owns comment  │                                  │  - owns posts    │
│    content       │         NATS Streaming           │  - commentCount  │
│  - full CRUD     │         (event bus)              │  - likeCount     │
└──────────────────┘                                  └──────────────────┘
        ▲                                                      │
        │          GET /api/posts/:postId/comments             │
        └──────────────────────────────────────────────────────┘
           (direct call, only when a user opens a post)
```

**Posts service** owns posts, comment/like counts, and the like/unlike routes.
**Comments service** owns comment content and is the only source of truth for it.

They don't share a database. They don't call each other synchronously except for one read (fetching full comments for a single post, on demand). Everything else is kept in sync through events.

## Key decisions

**No local copy of comment content in the posts service.**
Early on it seemed useful to mirror comment data locally (for previews, user activity, etc.), but none of those use cases held up:

- "Posts a user commented on" belongs to the comments service — it already has the data.
- A comment preview on the feed would need full comment bodies kept in sync, which means handling edits (`CommentUpdated`) and deletions, for a feature that wasn't actually planned.

So the posts service only keeps what it needs: a running `commentCount`. Full comment content is fetched directly from the comments service, and only when a user opens a specific post.

**Comment counts are kept in sync via events, with explicit idempotency handling.**
NATS Streaming guarantees _at-least-once_ delivery, meaning any event can arrive more than once. A naive `$inc` on every `CommentCreated` event would double-count on redelivery. This is solved with a `ProcessedEvent` model — a collection with a unique index on `commentId` — checked (via insert-and-catch, not check-then-act) before incrementing the count:

```ts
try {
  await ProcessedEvent.createProcessedEvent({ commentId });
  await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
  msg.ack();
} catch (err) {
  if (isDuplicateKeyError(err)) return msg.ack(); // already handled, safe to skip
  throw err; // something else failed — let NATS redeliver
}
```

`CommentDeletedListener` mirrors this: it decrements the count and removes the `ProcessedEvent` record, which makes a redelivered delete event a safe no-op (nothing to find, nothing to decrement again).

**Likes don't need their own service.**
Unlike comments, likes have no independent content, no edit history, and (for now) no "see what I've liked" feature. They're a toggle that affects a count. That's simple enough to live as routes directly inside the posts service, backed by a small `Like` model with a compound unique index on `(postId, userId)` to prevent double-likes and support unlike — no event bus needed for something this contained.

**Feed queries only read local data.**
`GET /api/posts` supports pagination, sorting (newest, oldest, most commented, most liked), and search (title or author name). None of it requires a call to the comments service — if it did, listing 20 posts would mean 20 extra network calls just to show comment counts. Keeping counts local to the Post document is what makes this a single, fast query.

## Known trade-offs

This is a learning project, so a few gaps are left in deliberately rather than solved with heavier machinery:

- **No transactional guarantee** between recording a processed event and applying the count change. If the process crashes between the two writes, a redelivered event can be skipped without its effect being applied, leaving the count off by one. Fixing this properly needs a Mongo transaction (replica set required) — noted as a possible next step, not implemented.
- **Event ordering isn't guaranteed** across listener instances. If `CommentCreated` and `CommentDeleted` for the same comment were ever processed out of order, the count could drift. In practice this is avoided because the delete listener skips processing entirely if the corresponding `ProcessedEvent` doesn't exist yet — but it's a known assumption, not a mechanically enforced guarantee.
- **Broker choice**: this uses NATS Streaming (STAN), which is deprecated upstream in favor of JetStream. It was already built and working when that was flagged, so it stayed — migrating to JetStream is a reasonable future step if this project continues.

## Stack

- Node.js / TypeScript
- Express
- MongoDB / Mongoose
- NATS Streaming (event bus)

## Services

| Service  | Responsibility                                               |
| -------- | ------------------------------------------------------------ |
| posts    | Posts, comment/like counts, like/unlike routes, feed queries |
| comments | Comment content, full CRUD, publishes comment events         |

## Possible next steps

- Migrate the event bus from NATS Streaming to JetStream
- Wrap count updates in a transaction to close the crash-window gap
- A separate profile service for "posts I've liked / commented on," if that feature becomes worth building

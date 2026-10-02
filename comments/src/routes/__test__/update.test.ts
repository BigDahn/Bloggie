import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Comment } from "../../models/comments";

const commentBuilder = async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const comment = Comment.createComment({
    userId,
    postId: new mongoose.Types.ObjectId().toHexString(),
    comment: "Programming in Javascript is kinda cool",
  });

  await comment.save();

  return { userId, comment };
};

it("throws an error when an unAuthenticated user tries to edit a post", async () => {
  const commentId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/comment/${commentId}`)
    .send({
      comment: "I love this song",
    })
    .expect(401);
});

it("successfully edits a comment", async () => {
  const { userId, comment } = await commentBuilder();
  const cookie = global.signin(userId);

  const response = await request(app)
    .put(`/api/comment/${comment.id}`)
    .set("Cookie", cookie)
    .send({
      comment: "TypeScript is kinda the best thing to happen to JS",
    })
    .expect(200);

  expect(response.body.comment).not.toEqual(comment.comment);
  expect(userId).toEqual(response.body.userId);
});

it("throws an error when an empty field is sent", async () => {
  const { userId, comment } = await commentBuilder();
  const cookie = global.signin(userId);

  await request(app)
    .put(`/api/comment/${comment.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(400);
});

it("throws an error when a user tries to edit a comment that isn't is", async () => {
  const { comment } = await commentBuilder();
  const id = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin(id);

  await request(app)
    .put(`/api/comment/${comment.id}`)
    .set("Cookie", cookie)
    .send({
      comment: "I'm a believer",
    })
    .expect(401);
});

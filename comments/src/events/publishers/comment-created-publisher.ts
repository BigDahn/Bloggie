import { Publisher, Subjects, CommentCreatedEvent } from '@bloggie/library';

export class CommentCreatedPublisher extends Publisher<CommentCreatedEvent> {
  readonly subject = Subjects.CommentCreated;
}

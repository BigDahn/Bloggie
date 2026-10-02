import { Publisher, CommentDeletedEvent, Subjects } from '@bloggie/library';

export class CommentDeletedPublisher extends Publisher<CommentDeletedEvent> {
  readonly subject = Subjects.CommentDeleted;
}

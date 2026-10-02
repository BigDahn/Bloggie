import { PostDeletedEvent, Publisher, Subjects } from '@bloggie/library';

export class PostDeletedPublisher extends Publisher<PostDeletedEvent> {
  readonly subject = Subjects.PostDeleted;
}

import { PostUpdatedEvent, Publisher, Subjects } from '@bloggie/library';

export class PostUpdatedPublisher extends Publisher<PostUpdatedEvent> {
  readonly subject = Subjects.PostUpdated;
}

import { PostCreatedEvent, Publisher, Subjects } from '@bloggie/library';

export class PostCreatedPublisher extends Publisher<PostCreatedEvent> {
  readonly subject = Subjects.PostCreated;
}

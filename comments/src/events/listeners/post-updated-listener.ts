import {
  Listener,
  NotFoundError,
  PostUpdatedEvent,
  Subjects,
} from '@bloggie/library';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import { Post } from '../../models/post';

export class PostUpdatedListener extends Listener<PostUpdatedEvent> {
  readonly subject = Subjects.PostUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: PostUpdatedEvent['data'], msg: Message) {
    const existingPost = await Post.findOne({
      postId: data.postId,
      isDeleted: false,
    });

    if (!existingPost) {
      throw new NotFoundError('Post does not exist');
    }

    await existingPost.save();

    msg.ack();
  }
}

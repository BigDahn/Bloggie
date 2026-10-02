import {
  Listener,
  NotFoundError,
  PostDeletedEvent,
  Subjects,
} from '@bloggie/library';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import { Post } from '../../models/post';

export class PostDeletedListener extends Listener<PostDeletedEvent> {
  readonly subject = Subjects.PostDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: PostDeletedEvent['data'], msg: Message) {
    const post = await Post.findOne({ postId: data.postId });

    if (!post) {
      throw new NotFoundError('Post does not exist');
    }

    post.isDeleted = true;

    await post.save();

    msg.ack();
  }
}

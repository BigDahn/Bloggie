import {
  BadRequestError,
  Listener,
  PostCreatedEvent,
  Subjects,
} from '@bloggie/library';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import { Post } from '../../models/post';

export class PostCreatedListener extends Listener<PostCreatedEvent> {
  readonly subject = Subjects.PostCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: PostCreatedEvent['data'], msg: Message) {
    const existingPost = await Post.findOne({
      postId: data.postId,
    });

    if (existingPost) {
      throw new BadRequestError('Can not create a post that already exists');
    }

    const post = Post.createPost({
      postId: data.postId,
    });

    await post.save();

    msg.ack();
  }
}

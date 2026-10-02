import { CommentDeletedEvent } from '@bloggie/library';
import { natsWrapper } from '../../../nats-wrapper';
import { CommentDeletedListener } from '../comment-deleted-listener';
import { Post } from '../../../models/posts';
import mongoose from 'mongoose';
import { ProcessedEvent } from '../../../models/processed';

const setup = async () => {
  const listener = new CommentDeletedListener(natsWrapper.client);

  const post = Post.createPost({
    userId: new mongoose.Types.ObjectId().toHexString(),
    authorName: 'John Cole',
    title: 'Blow up',
    excerpt: 'Friday Night Lights',
    content: 'The song for my haters',
  });

  post.commentCount = 5;
  await post.save();

  const data: CommentDeletedEvent['data'] = {
    postId: post.id,
    commentId: new mongoose.Types.ObjectId().toHexString(),
    userId: post.userId,
  };

  await ProcessedEvent.createProcessedEvent({
    commentId: data.commentId,
  });
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,

    msg,
    post,
  };
};

it('successfully updates and reduces the comment count', async () => {
  const { listener, msg, data, post } = await setup();

  await listener.onMessage(data, msg);

  const updatedComment = await Post.findById(data.postId);

  expect(updatedComment?.commentCount).not.toEqual(post.commentCount);
});

it('successfully acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

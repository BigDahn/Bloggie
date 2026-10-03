import mongoose from 'mongoose';
import { Post } from '../../../models/post';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { PostDeletedEvent } from '@bloggie/library';
import { PostDeletedListener } from '../post-deleted-listener';

const setup = async () => {
  const post = Post.createPost({
    postId: new mongoose.Types.ObjectId().toHexString(),
  });

  await post.save();

  const listener = new PostDeletedListener(natsWrapper.client);

  const data: PostDeletedEvent['data'] = {
    postId: post.postId,
  };

  // @ts-expect-error: Message type requires additional NATS fields for a full mock
  const msg: Message = {
    ack: jest.fn(),
  };
  return {
    listener,
    post,
    data,
    msg,
  };
};

it('successfully marks a post as deleted', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedPost = await Post.findOne({ postId: data.postId });

  expect(updatedPost).toBeDefined();
  expect(updatedPost!.isDeleted).toEqual(true);
});

it('successfully acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

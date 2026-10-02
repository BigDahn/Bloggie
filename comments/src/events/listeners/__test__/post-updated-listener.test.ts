import mongoose from 'mongoose';
import { Post } from '../../../models/post';
import { natsWrapper } from '../../../nats-wrapper';

import { Message } from 'node-nats-streaming';
import { PostUpdatedEvent } from '@bloggie/library';
import { PostUpdatedListener } from '../post-updated-listener';

const setup = async () => {
  const listener = new PostUpdatedListener(natsWrapper.client);

  const post = Post.createPost({
    postId: new mongoose.Types.ObjectId().toHexString(),
  });

  await post.save();

  const data: PostUpdatedEvent['data'] = {
    postId: post.postId,
  };

  //@ts-ignore
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

it('successfully updates a post', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedPost = await Post.findOne({ postId: data.postId });

  expect(updatedPost).toBeDefined();
  expect(updatedPost!.postId).toEqual(data.postId);
});

it('successfully acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

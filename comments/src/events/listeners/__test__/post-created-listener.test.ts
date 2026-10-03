import mongoose from 'mongoose';
import { Post } from '../../../models/post';
import { natsWrapper } from '../../../nats-wrapper';
import { PostCreatedListener } from '../post-created-listener';
import { Message } from 'node-nats-streaming';
import { PostCreatedEvent } from '@bloggie/library';

const setup = async () => {
  const listener = new PostCreatedListener(natsWrapper.client);

  const data: PostCreatedEvent['data'] = {
    postId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-expect-error: Message type requires additional NATS fields for a full mock
  const msg: Message = {
    ack: jest.fn(),
  };
  return {
    listener,
    data,
    msg,
  };
};

it('successfully creates and save a post', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const newPost = Post.createPost({
    postId: data.postId,
  });

  expect(newPost).toBeDefined();
  expect(newPost.postId).toEqual(data.postId);
});

it('successfully acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

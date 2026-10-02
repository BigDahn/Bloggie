import { CommentCreatedEvent } from '@bloggie/library';
import { natsWrapper } from '../../../nats-wrapper';
import { CommentCreatedListener } from '../comment-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Post } from '../../../models/posts';

const setup = async () => {
  // create a listener
  const listener = new CommentCreatedListener(natsWrapper.client);

  // create a fake post
  const post = Post.createPost({
    userId: new mongoose.Types.ObjectId().toHexString(),
    authorName: 'John Cole',
    title: 'Blow up',
    excerpt: 'Friday Night Lights',
    content: 'The song for my haters',
  });

  await post.save();

  // create a fake data object

  const data: CommentCreatedEvent['data'] = {
    postId: post.id,
    commentId: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    post,
    msg,
  };
};

it('successfully saves a comment and updates the commentCount', async () => {
  const { listener, data, msg, post } = await setup();

  await listener.onMessage(data, msg);

  const postUpdated = await Post.findById(data.postId);

  expect(post.commentCount).not.toEqual(postUpdated?.commentCount);
  expect(post.id).toEqual(postUpdated?.id);
  expect(post.title).toEqual(postUpdated!.title);
});

it('successfully acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

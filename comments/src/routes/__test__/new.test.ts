import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Post } from '../../models/post';
import { Comment } from '../../models/comments';
import { natsWrapper } from '../../nats-wrapper';

const postFunction = async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const post = Post.createPost({
    postId: new mongoose.Types.ObjectId().toHexString(),
  });

  const comment = Comment.createComment({
    userId: userId,
    postId: post.postId,
    comment: 'Good vibe',
  });

  await comment.save();
  await post.save();

  return { userId, post, comment };
};

it('successfully creates a comment', async () => {
  const { userId, post } = await postFunction();

  const cookie = global.signin(userId);
  await request(app)
    .post(`/api/posts/${post.postId}/comments`)
    .set('Cookie', cookie)
    .send({
      comment: 'A new album by the weekend',
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('throws an error when an unauthorized user tries to comment to a post', async () => {
  const { post } = await postFunction();

  await request(app)
    .post(`/api/posts/${post.postId}/comments`)
    .send({
      comment: 'Listening to Mj is a vibe',
    })
    .expect(401);
  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});

it('throws an error when an empty field is sent', async () => {
  const { userId, post } = await postFunction();
  const cookie = global.signin(userId);

  await request(app)
    .post(`/api/posts/${post.postId}/comments`)
    .set('Cookie', cookie)
    .send()
    .expect(400);
});

it("throws an error when a user tries to comment to a that post doesn't exist or a deleted post", async () => {
  const { userId } = await postFunction();
  const cookie = global.signin(userId);
  await request(app)
    .post(`/api/posts/${new mongoose.Types.ObjectId().toHexString()}/comments`)
    .set('Cookie', cookie)
    .send({
      comment: 'Liberian Girl',
    })
    .expect(404);
});

it('successfully creates a reply to an existing comment to a post', async () => {
  const { userId, post, comment } = await postFunction();
  const cookie = global.signin(userId);

  await request(app)
    .post(`/api/posts/${post.postId}/comments`)
    .set('Cookie', cookie)
    .send({
      comment: 'Inside the closet',
      parentCommentId: comment.id,
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

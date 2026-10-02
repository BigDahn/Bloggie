import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';

import { Comment } from '../../models/comments';

const commentBuilder = async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const comment = Comment.createComment({
    userId,
    postId: new mongoose.Types.ObjectId().toHexString(),
    comment: 'Programming in Javascript is kinda cool',
  });

  await comment.save();

  return { userId, comment };
};

it("throws an error when a user tries to delete a comment that isn't his", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin(id);
  const { comment } = await commentBuilder();

  await request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(401);

  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});

it('throws an error when an unAuthenticated user tries to edit a post', async () => {
  const commentId = new mongoose.Types.ObjectId().toHexString();
  await request(app).delete(`/api/comments/${commentId}`).send().expect(401);
});

it('successfully edits a comment', async () => {
  const { userId, comment } = await commentBuilder();
  const cookie = global.signin(userId);

  await request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);
});

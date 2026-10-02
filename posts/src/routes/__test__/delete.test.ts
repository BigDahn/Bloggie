import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Post } from '../../models/posts';
import { natsWrapper } from '../../nats-wrapper';

it('throws an error when an unauthorized user tries to delete a post', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).delete(`/api/posts/${id}`).send().expect(401);
});

it('author successfully deletes a post', async () => {
  const cookie = global.signin();

  const postResponse = await request(app)
    .post('/api/post')
    .set('Cookie', cookie)
    .send({
      title: 'Euphoria',
      content: 'The weekend',
      excerpt: 'Alone at night',
    })
    .expect(201);

  await request(app)
    .delete(`/api/posts/${postResponse.body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);
});

it('emits an event after post has been deleted', async () => {
  const cookie = global.signin();
  const postResponse = await request(app)
    .post('/api/post')
    .set('Cookie', cookie)
    .send({
      title: 'Euphoria',
      content: 'Kiss Land',
      excerpt: 'Happiness',
    })
    .expect(201);
  await request(app)
    .delete(`/api/posts/${postResponse.body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('throws an error when another author tries to delete another post', async () => {
  const cookie = global.signin();
  const post = Post.createPost({
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'Euphorisa',
    content: 'Lkksd',
    excerpt: 'timeer',
    authorName: 'dahn',
  });

  await post.save();

  await request(app)
    .delete(`/api/posts/${post.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(401);

  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});

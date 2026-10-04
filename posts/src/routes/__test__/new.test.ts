import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('throws an error when an unauthorized user tries to creates a post', async () => {
  await request(app)
    .post('/api/posts')
    .send({
      userId: new mongoose.Types.ObjectId().toHexString(),
      title: 'Euphoria',
      content: 'Lakksdjksdkksd',
      excerpt: 'akiowek',
      authorName: 'dahn',
    })
    .expect(401);
});

it('successfully creates a new post', async () => {
  const cookie = global.signin();

  await request(app)
    .post('/api/posts')
    .set('Cookie', cookie)
    .send({
      title: 'Euphoria',
      content: 'Lakksdjksdkksd',
      excerpt: 'akiowek',
    })
    .expect(201);
});

it('throws an error when providing an invalid field ', async () => {
  const cookie = global.signin();

  await request(app)
    .post('/api/posts')
    .set('Cookie', cookie)
    .send({
      title: 'Euphoria',
      content: 'Lakksdjksdkksd',
      note: 'akiowek',
    })
    .expect(400);
});

it('throws an error when no field is provided ', async () => {
  const cookie = global.signin();

  await request(app)
    .post('/api/posts')
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it('successfully publishes an event after the post was created', async () => {
  const cookie = global.signin();

  await request(app)
    .post('/api/posts')
    .set('Cookie', cookie)
    .send({
      title: 'Euphoria',
      content: 'Lakksdjksdkksd',
      excerpt: 'akiowek',
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

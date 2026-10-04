import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Post } from '../../models/posts';

it('throws an error when an unauthorized user tries to access the route', async () => {
  await request(app)
    .put(`/api/posts/${new mongoose.Types.ObjectId().toHexString()}`)
    .send({
      title: 'The weekend',
      excerpt: 'Always gonna find a way',
      content: 'This place is never what it seems',
    })
    .expect(401);
});

it('an author successfully updates his post', async () => {
  const cookie = global.signin();

  const post1 = await request(app)
    .post('/api/posts')
    .set('Cookie', cookie)
    .send({
      title: 'The weekend',
      excerpt: 'Always gonna find a way',
      content: 'This place is never what it seems',
    })
    .expect(201);

  const updatedPost = await request(app)
    .put(`/api/posts/${post1.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'The Weekend Special',
      excerpt: 'Always gonna find a way',
      content: 'This place is never what it seems',
    })
    .expect(200);

  expect(updatedPost.body.title).not.toEqual(post1.body.title);
});

it('emits an event when a post is edited successfully', async () => {
  const cookie = global.signin();

  const post1 = await request(app)
    .post('/api/posts')
    .set('Cookie', cookie)
    .send({
      title: 'The weekend',
      excerpt: 'Always gonna find a way',
      content: 'This place is never what it seems',
    })
    .expect(201);
  await request(app)
    .put(`/api/posts/${post1.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'The Weekend Special',
      excerpt: 'Always gonna find a way',
      content: 'This place is never what it seems',
    })
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('throws an error when another person tries to edit another post', async () => {
  const cookie = global.signin();

  const post = Post.createPost({
    userId: new mongoose.Types.ObjectId().toHexString(),
    authorName: 'The weekend',
    title: 'HUT',
    excerpt: 'Drive',
    content: "Just because i'm a child again.",
  });
  await post.save();

  await request(app)
    .put(`/api/posts/${post.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'The Weekend Special',
      excerpt: 'Always gonna find a way',
      content: 'This place is never what it seems',
    })
    .expect(401);

  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});

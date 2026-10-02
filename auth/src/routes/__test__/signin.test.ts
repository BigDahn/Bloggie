import request from 'supertest';
import { app } from '../../app';

it('fails when an email that does not exist is provided', async () => {
  await request(app)
    .post('/api/auth/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('fails when an incorrect password is provided', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test@test.com',
      firstName: 'test',
      lastName: 'last',
      password: 'password',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/auth/signin')
    .send({
      email: 'test@test.com',
      password: 'newPassword',
    })
    .expect(400);
});

it('fails when an incorrect email is provided', async () => {
  await request(app)
    .post('/api/auth/signin')
    .send({
      email: 'test2123.com',
      password: 'password',
    })
    .expect(400);
});

it('successfully sets the cookie after successful sign in', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test@test.com',
      firstName: 'test',
      lastName: 'last',
      password: 'password',
    })
    .expect(201);
  const response = await request(app).post('/api/auth/signin').send({
    email: 'test@test.com',
    password: 'password',
  });

  expect(response.get('Set-Cookie')).toBeDefined();
});

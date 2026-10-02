import { app } from '../../app';
import request from 'supertest';

it('clears cookie after signing out', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test23@test.com',
      firstName: 'test',
      lastName: 'last',
      password: 'password',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signout')
    .send()
    .expect(200);

  const cookie = response.get('Set-Cookie');
  if (!cookie) {
    throw new Error('Expected cookie but got undefined.');
  }

  expect(cookie[0]).toEqual(
    'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  );
  expect(cookie[1]).toEqual(
    'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  );
});

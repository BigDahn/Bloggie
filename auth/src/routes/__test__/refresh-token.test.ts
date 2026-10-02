import request from 'supertest';
import { app } from '../../app';

it('throws an error if an authorized user tries to request for a refresh token', async () => {
  await request(app).post('/api/users/refresh').send().expect(401);
});

it('successfully sends a refresh token', async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .post('/api/users/refresh')
    .set('Cookie', cookie)
    .send()
    .expect(200);
});

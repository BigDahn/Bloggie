import request from 'supertest';
import { app } from '../../app';

it('successfully verifies the otp , marks the user as verified and sends the token', async () => {
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
    .post('/api/auth/verifyOtp')
    .send({
      email: 'test@test.com',
      otp: '542314',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});

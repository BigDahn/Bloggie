import { app } from '../../app';
import request from 'supertest';
import { OtpService } from '../../services/otp-service';
import { natsWrapper } from '../../nats-wrapper';

it('successfully generates a new otp and publishes an event', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test@test.com',
      firstName: 'test',
      lastName: 'last',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post('/api/auth/resendOtp')
    .send({
      email: 'test@test.com',
    })
    .expect(200);

  expect(OtpService.generateOtp).toHaveBeenCalled();

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('returns an error if an unrecognized email is provided', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test@test.com',
      firstName: 'test',
      lastName: 'last',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post('/api/auth/resendOtp')
    .send({
      email: 'test123@test.com',
    })
    .expect(400);
});

it('throws an error if a verified user tries to request for an otp', async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get('/api/users/currentUser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  await request(app)
    .post('/api/auth/resendOtp')
    .send({
      email: response.body.currentUser.email,
    })
    .expect(400);
});

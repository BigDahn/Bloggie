import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { OtpService } from '../../services/otp-service';

it('returns an error for an invalid email', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test23.com',
      firstName: 'test',
      lastName: 'last',
      password: 'password',
    })
    .expect(400);
});

it('returns an error for an invalid password', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test23.com',
      firstName: 'test',
      lastName: 'last',
      password: 'p',
    })
    .expect(400);
});

it('throws an error for missing email and password fields', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      firstName: 'test',
      lastName: 'last',
    })
    .expect(400);
});

it('throws an error for missing fields', async () => {
  await request(app).post('/api/auth/signup').send().expect(400);
});

it('successfully signs up a user', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test23@test.com',
      firstName: 'test',
      lastName: 'last',
      password: 'password',
    })
    .expect(201);
});

it('successfully generates the otp and publishes an event ', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test@test.com',
      firstName: 'test',
      lastName: 'last',
      password: 'password',
    })
    .expect(201);

  expect(OtpService.generateOtp).toHaveBeenCalled();

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

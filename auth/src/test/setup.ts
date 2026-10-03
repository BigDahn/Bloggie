import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';

declare global {
  var signin: () => Promise<string[]>;
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.ACCESS_TOKEN_SECRET = 'asdflkjhg';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
}, 10000);

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
}, 10000);

global.signin = async () => {
  const password = 'password';
  const email = 'test@test.com';
  const firstName = 'test';
  const otp = 534211;
  const lastName = 'blogs';

  await request(app)
    .post('/api/auth/signup')
    .send({
      email,
      firstName,
      lastName,
      password,
    })
    .expect(201);
  const response = await request(app)
    .post('/api/auth/verifyOtp')
    .send({
      email,
      otp,
    })
    .expect(200);

  const cookie = response.get('Set-Cookie');

  if (!cookie) {
    throw new Error('Failed to get cookie from response');
  }
  return cookie;
};

import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

import mongoose from 'mongoose';

declare global {
  var signin: (id?: string) => string[];
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.ACCESS_TOKEN_SECRET = 'asdflkjhg';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
}, 10000);

beforeEach(async () => {
  jest.clearAllMocks();
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

global.signin = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
    fullName: 'Frost wayne',
    verified: true,
  };

  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!);

  const cookie = {
    accessToken: token,
  };
  //Turn that cookie into JSON
  const cookieJSON = JSON.stringify(cookie.accessToken);

  // Turn that JSON and encode it as base64
  // const base64 = Buffer.from(sessionJSON).toString('base64');

  // console.log(base64);

  // returns a string that the cookie with the encoded data
  return [
    `accessToken=${cookieJSON};  Max-Age=900; Path=/; Expires=Sun, 20 Sep 2026 11:18:31 GMT; HttpOnly`,
  ];
};

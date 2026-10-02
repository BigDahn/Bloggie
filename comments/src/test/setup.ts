import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signin: (id?: string) => string[];
}

let mongo: any;

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

    for (let collection of collections) {
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
    fullName: 'Frost Wayne',
    verified: true,
  };

  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!);

  const cookie = {
    accessToken: token,
  };

  const cookieJSON = JSON.stringify(cookie.accessToken);

  return [
    `accessToken=${cookieJSON}; Max-Age=900; Path=/; Expires=Sun,20 Sep 2026 11:18:31 GMT; HttpOnly`,
  ];
};

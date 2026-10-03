import { app } from './app';
import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@bloggie/library';
import { natsWrapper } from './nats-wrapper';
import { PostCreatedListener } from './events/listeners/post-created-listener';
import { PostUpdatedListener } from './events/listeners/post-updated-listener';
import { PostDeletedListener } from './events/listeners/post-deleted-listener';

const retryDBConnection = async (
  url: string,
  retries: number = 5,
  delay: number = 3000,
): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(url, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log('CONNECTED TO DB');
    } catch (error) {
      console.log(
        `MONGO CONNECTION ATTEMPT ${attempt}/${retries} FAILED. RETRYING IN ${delay}Ms.... `,
      );

      if (attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI MUST BE DEFINED');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID MUST BE DEFINED');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID MUST BE DEFINED');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL MUST BE DEFINED');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLIENT_ID,
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_URL,
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS CONNECTION HAS CLOSED');

      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new PostCreatedListener(natsWrapper.client).listen();
    new PostUpdatedListener(natsWrapper.client).listen();
    new PostDeletedListener(natsWrapper.client).listen();

    await retryDBConnection(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
    throw new DatabaseConnectionError();
  }

  app.listen(3000, () => {
    console.log('COMMENT SERVICE RUNNING ON PORT 3000.....');
  });
};

start();

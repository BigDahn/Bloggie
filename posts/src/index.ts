import { DatabaseConnectionError } from '@bloggie/library';
import { app } from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';

const connectWithRetry = async (
  uri: string,
  retries = 5,
  delayMs = 3000,
): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('connected to DB');
      return;
    } catch (error) {
      console.log(
        `Mongo connection attempt ${attempt}/${retries} failed. Retrying in ${delayMs}ms...`,
      );
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL,
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS CONNECTION HAS CLOSED');

      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    await connectWithRetry(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
    throw new DatabaseConnectionError();
  }
  app.listen(3000, () => {
    console.log('Post service listening on port 3000');
  });
};

start();

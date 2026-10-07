import { VerificationOtpListener } from './events/listeners/verification-otp-listener';
import { ResendOtpListener } from './events/listeners/resend-otp-listener';

import { natsWrapper } from './nats-wrapper';

const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.REDIS_HOST) {
    throw new Error('REDIS_HOST must be defined');
  }
  if (!process.env.REDIS_PORT) {
    throw new Error('REDIS_PORT must be defined');
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

    new ResendOtpListener(natsWrapper.client).listen();
    new VerificationOtpListener(natsWrapper.client).listen();
  } catch (error) {
    console.log(error);
  }
};

start();

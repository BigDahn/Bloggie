import { Queue } from 'bullmq';

interface Payload {
  id: string;
  email: string;
  otp: string;
}

const deliveryQueue = new Queue<Payload>('delivery-queue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export { deliveryQueue };

import { Worker } from 'bullmq';
import { sendOtp } from '../services/send-otp-service';

const deliveryWorker = new Worker(
  'delivery-queue',
  async (job) => {
    switch (job.name) {
      case 'send-otp':
        await sendOtp(job.data.email, job.data.otp);
        break;
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  },
);

deliveryWorker.on('completed', (job) => {
  console.log(`Delivery job completed: ${job.id}`);
});

deliveryWorker.on('failed', (job, err) => {
  console.error(`Delivery job failed: ${job?.id}, Error: ${err.message}`);
});

export { deliveryWorker };

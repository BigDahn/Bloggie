import { Listener, Subjects, UserVerificationOtpEvent } from '@bloggie/library';
import { queueGroupName } from '../queueGroupName';
import { Message } from 'node-nats-streaming';
import { deliveryQueue } from '../../queues/delivery-queue';

export class VerificationOtpListener extends Listener<UserVerificationOtpEvent> {
  readonly subject = Subjects.UserVerificationOtp;
  queueGroupName = queueGroupName;

  async onMessage(data: UserVerificationOtpEvent['data'], msg: Message) {
    await deliveryQueue.add(
      'send-otp',
      {
        id: data.id,
        email: data.email,
        otp: data.otp,
      },
      {
        jobId: data.id,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000, // 1s, then 2s, then 4s between retries
        },
      },
    );

    msg.ack();
  }
}

import { Listener, Subjects, UserResendOtpEvent } from '@bloggie/library';
import { queueGroupName } from '../queueGroupName';
import { Message } from 'node-nats-streaming';
import { deliveryQueue } from '../../queues/delivery-queue';

export class ResendOtpListener extends Listener<UserResendOtpEvent> {
  readonly subject = Subjects.UserResendOtp;
  queueGroupName = queueGroupName;

  async onMessage(data: UserResendOtpEvent['data'], msg: Message) {
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

import { AckHandlerCallback } from 'node-nats-streaming';

export const natsWrapper = {
  client: {
    publish: jest.fn().mockImplementation((email: string, otp: string) => {
      return 'guid';
    }),
  },
};

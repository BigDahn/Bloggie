import { AckHandlerCallback } from 'node-nats-streaming';

export const natsWrapper = {
  client: {
    publish: jest.fn().mockImplementation((data: string) => {
      return 'guid';
    }),
  },
};

export const natsWrapper = {
  client: {
    publish: jest.fn().mockImplementation(() => {
      return 'guid';
    }),
  },
};

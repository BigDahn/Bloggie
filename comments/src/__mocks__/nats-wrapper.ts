export const natsWrapper = {
  client: {
    publish: jest.fn().mockImplementation((data: string) => {
      return "guid";
    }),
  },
};

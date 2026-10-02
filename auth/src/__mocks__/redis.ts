const redis = {
  set: jest.fn(),
  get: jest.fn(),
  expire: jest.fn(),
  incr: jest.fn(),
};

export default redis;

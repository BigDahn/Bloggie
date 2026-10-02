import Redis from 'ioredis';

console.log('Hello redis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.log(err);
});

export default redis;

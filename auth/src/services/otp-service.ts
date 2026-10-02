import crypto from 'crypto';
import redis from './redis';
import { BadRequestError } from '@bloggie/library';

export class OtpService {
  static async generateOtp(identifier: string): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const attemptKey = `otp-attempts:${identifier}`;
    const attempts = await redis.incr(attemptKey);

    if (attempts === 1) await redis.expire(attemptKey, 5 * 60);

    if (attempts > 5) {
      throw new BadRequestError(
        'Too many otp request made.. Try again in 5 minutes',
      );
    }

    await redis.set(`otp:${identifier}`, otp, 'EX', 5 * 60);

    return otp;
  }

  static async verifyOtp(identifier: string, otp: string): Promise<boolean> {
    const storedOtp = await redis.get(`otp:${identifier}`);
    if (!storedOtp || storedOtp !== otp) return false;

    await redis.del(`otp:${identifier}`);
    await redis.del(`otp-attempts:${identifier}`);
    return true;
  }
}

import express, { Request, Response } from 'express';
import { User } from '../models/user';
import { randomUUID } from 'crypto';

import { OtpService } from '../services/otp-service';
import { ValidateRequest, BadRequestError } from '@bloggie/library';
import { body } from 'express-validator';
import { ResendOtpPublisher } from '../events/publisher/resend-otp-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/auth/resendOtp',
  [body('email').isEmail().withMessage('Please Provide a valid Email Address')],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('Invalid Credentials');
    }

    if (user.isVerified) {
      throw new BadRequestError('Proceed to Login');
    }

    const otp = await OtpService.generateOtp(user.id);

    // publish an event with the otp and email

    new ResendOtpPublisher(natsWrapper.client).publish({
      id: randomUUID(),
      email: user.email,
      otp: otp,
    });

    res.status(200).send('Otp has been sent to your email');
  },
);

export { router as ResendOtpRouter };

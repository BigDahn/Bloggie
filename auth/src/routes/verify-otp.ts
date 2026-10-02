import express, { Request, Response } from 'express';
import { OtpService } from '../services/otp-service';
import { User } from '../models/user';

import { issueToken } from '../services/issue-tokens';
import {
  ValidateRequest,
  NotAuthorizedError,
  BadRequestError,
} from '@bloggie/library';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/api/auth/verifyOtp',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('Otp must be 6 digits'),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new NotAuthorizedError('Invalid Credentials');
    }

    if (user.isVerified) {
      throw new BadRequestError(
        'Account Has been verified.. Please Proceed to Login',
      );
    }

    if (!(await OtpService.verifyOtp(user.id, otp))) {
      throw new BadRequestError('Invalid OTP');
    }

    user.isVerified = true;
    await user.save();

    // if the user does exist send an access token

    await issueToken(res, user);

    // publish an event to notify the user via email that their account has been verified

    // redirect to login

    res.status(200).send(user);
  },
);

export { router as VerifyOtpRouter };

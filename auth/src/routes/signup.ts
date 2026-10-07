import express, { Request, Response } from 'express';
import { User } from '../models/user';
import { v4 as uuidv4 } from 'uuid';

import { OtpService } from '../services/otp-service';
import { ValidateRequest, BadRequestError } from '@bloggie/library';
import { body } from 'express-validator';
import { VerificationOtp } from '../events/publisher/verification-otp-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/auth/signup',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('firstName')
      .isString()
      .toLowerCase()
      .withMessage('Please Provide your first name'),
    body('lastName')
      .isString()
      .toLowerCase()
      .withMessage('Please Provide your last name'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 to 20 characters'),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { email, firstName, lastName, password } = req.body;

    // check if there is anybody with that email

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email Already In Use');
    }

    const user = User.createUser({
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: password,
    });

    await user.save();

    // publish an event to the delivery service sending thr OTP to verify the user
    const otp = await OtpService.generateOtp(user.id);

    // publishing an event here

    new VerificationOtp(natsWrapper.client).publish({
      id: uuidv4(),
      email: user.email,
      otp: otp,
    });

    // send a response saying otp has been sent to user's email

    res.status(201).send('Otp has been sent to your registered email');
  },
);

export { router as SignUpRouter };

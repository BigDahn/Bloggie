import express, { Request, Response } from 'express';
import { User } from '../models/user';
import { Password } from '../services/password';

import { issueToken } from '../services/issue-tokens';
import { ValidateRequest, BadRequestError } from '@bloggie/library';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/api/auth/signin',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  ValidateRequest,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // check if the user exists on the DB
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError('Invalid Credentials');
    }

    // verify the passwords if it matches
    const passwordCompare = await Password.comparePassword(
      existingUser.password,
      password,
    );

    if (!passwordCompare) {
      throw new BadRequestError('Invalid Credentials');
    }

    await issueToken(res, existingUser);

    res.status(200).send(existingUser);
  },
);

export { router as SigninRouter };

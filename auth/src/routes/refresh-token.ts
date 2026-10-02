import express, { Request, Response } from 'express';
import { Refresh } from '../models/refreshToken';
import { User } from '../models/user';
import { NotAuthorizedError } from '@bloggie/library';
import { issueToken } from '../services/issue-tokens';

const router = express.Router();

router.post('/api/users/refresh', async (req: Request, res: Response) => {
  const oldToken = req.cookies.refreshToken;

  if (!oldToken) {
    throw new NotAuthorizedError('Invalid Token');
  }

  const stored = await Refresh.findOne({ refreshToken: oldToken });
  if (!stored) {
    throw new NotAuthorizedError('Invalid refresh token');
  }

  if (stored.revoked || stored.expiresAt < new Date()) {
    await Refresh.updateMany({ userId: stored.userId }, { revoked: true });
    throw new NotAuthorizedError('Invalid refresh token — please log in again');
  }

  stored.revoked = true;
  await stored.save();

  const existingUser = await User.findById(stored.userId);

  if (!existingUser) {
    throw new Error('Invalid Request');
  }

  await issueToken(res, existingUser);

  // send the response to the user

  res.status(200).send(existingUser);
});

export { router as RefreshTokenRouter };

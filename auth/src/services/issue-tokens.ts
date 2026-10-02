import { Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Refresh } from '../models/refreshToken';
import { UserDoc } from '../models/user';

export async function issueToken(res: Response, user: UserDoc) {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: `${user.firstName} ${user.lastName}`,
      verified: user.isVerified,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' },
  );

  // generate a new refresh token and save to the db
  const refreshToken = crypto.randomBytes(40).toString('hex');

  const refresh = Refresh.createRefresh({
    userId: user.id,
    refreshToken: refreshToken,
    revoked: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // save the refresh token to the db

  await refresh.save();

  // send both the refresh and access token to the user via res.cookie

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

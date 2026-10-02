import express, { Request, Response } from 'express';
import { Refresh } from '../models/refreshToken';

const router = express.Router();

router.post('/api/users/signout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await Refresh.updateOne({ refreshToken }, { revoked: true });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).send('Logged Out');
});

export { router as SignOutRouter };

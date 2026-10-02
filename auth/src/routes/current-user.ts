import express, { Request, Response } from 'express';
import { currentUser } from '@bloggie/library';

const router = express.Router();

router.get(
  '/api/users/currentUser',
  currentUser,
  async (req: Request, res: Response) => {
    res.send({ currentUser: req.user || null });
  },
);

export { router as CurrentUserRouter };

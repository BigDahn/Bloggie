import express, { Request, Response } from 'express';
import { Comment } from '../models/comments';
import {
  NotFoundError,
  ValidateRequest,
  RequireAuth,
  NotAuthorizedError,
} from '@bloggie/library';
import { body } from 'express-validator';

const router = express.Router();

router.put(
  '/api/comments/:commentId',
  RequireAuth,
  [body('comment').isString().notEmpty().withMessage('This field is required')],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { comment } = req.body;

    const existingComment = await Comment.findById(commentId);

    if (!existingComment || existingComment.isDeleted) {
      throw new NotFoundError('Comment does not exist');
    }

    if (existingComment.userId !== req.user!.id) {
      throw new NotAuthorizedError('You are not allowed to edit this comment');
    }

    existingComment.comment = comment;

    await existingComment.save();

    res.status(200).send(existingComment);
  },
);

export { router as UpdateCommentRouter };

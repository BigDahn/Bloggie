import {
  NotFoundError,
  RequireAuth,
  NotAuthorizedError,
} from '@bloggie/library';
import express, { Request, Response } from 'express';
import { Comment } from '../models/comments';
import { CommentDeletedPublisher } from '../events/publishers/comment-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/comments/:commentId',
  RequireAuth,
  async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment || comment.isDeleted) {
      throw new NotFoundError('Comment does not exist');
    }

    if (comment.userId !== req.user!.id) {
      throw new NotAuthorizedError('Not authorized to delete this comment');
    }

    comment.isDeleted = true;

    await comment.save();

    // publish an event
    new CommentDeletedPublisher(natsWrapper.client).publish({
      postId: comment.postId,
      commentId: comment.id,
      userId: req.user!.id,
    });
    res.status(200).send(comment);
  },
);

export { router as DeleteCommentRouter };

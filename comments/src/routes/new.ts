import {
  BadRequestError,
  NotFoundError,
  RequireAuth,
  ValidateRequest,
} from '@bloggie/library';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Post } from '../models/post';
import { Comment } from '../models/comments';
import { CommentCreatedPublisher } from '../events/publishers/comment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/posts/:postId/comments',
  RequireAuth,
  [
    body('comment')
      .isString()
      .notEmpty()
      .withMessage('Comment text is required'),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { comment, parentCommentId } = req.body;
    const post = await Post.findOne({ postId, isDeleted: false });

    if (!post) {
      throw new NotFoundError('Post is not found');
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (
        !parentComment ||
        parentComment.postId !== postId ||
        parentComment.isDeleted === true
      ) {
        throw new BadRequestError('Invalid Parent comment');
      }
    }

    const newComment = Comment.createComment({
      userId: req.user!.id,
      postId: post.id,
      comment: comment,
      parentCommentId,
    });

    await newComment.save();

    //publish an event

    new CommentCreatedPublisher(natsWrapper.client).publish({
      postId: post.id,
      commentId: newComment.id,
      userId: req.user!.id,
    });

    res.status(201).send(newComment);
  },
);

export { router as CreateCommentRouter };

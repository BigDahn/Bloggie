import {
  NotAuthorizedError,
  NotFoundError,
  RequireAuth,
  ValidateRequest,
} from '@bloggie/library';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Post } from '../models/posts';
import { PostUpdatedPublisher } from '../events/publishers/post-updated-events';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/post/:id',
  RequireAuth,
  [
    body('title').isString().withMessage('Every post must have a title'),
    body('excerpt').isString().withMessage('Every post must have an excerpt'),
    body('content').isString().withMessage('Every post must have a content'),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { title, excerpt, content } = req.body;
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post || post.isDeleted) {
      throw new NotFoundError('Post not found');
    }

    if (post?.userId !== req.user!.id) {
      throw new NotAuthorizedError('Not Authorized to edit this post');
    }

    post.title = title;
    post.excerpt = excerpt;
    post.content = content;
    await post.save();

    // publish an event to show the updated post

    new PostUpdatedPublisher(natsWrapper.client).publish({
      postId: post.id,
    });

    res.status(200).send(post);
  },
);

export { router as UpdatePostRouter };

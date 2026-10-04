import { RequireAuth, ValidateRequest } from '@bloggie/library';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Post } from '../models/posts';
import { PostCreatedPublisher } from '../events/publishers/post-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/posts',
  RequireAuth,
  [
    body('title').isString().withMessage('Every post must have a title'),
    body('excerpt').isString().withMessage('Every post must have an excerpt'),
    body('content').isString().withMessage('Every post must have a content'),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { title, excerpt, content } = req.body;

    const post = Post.createPost({
      userId: req.user!.id,
      authorName: req.user!.fullName,
      title,
      excerpt,
      content,
    });

    await post.save();

    new PostCreatedPublisher(natsWrapper.client).publish({
      postId: post.id,
    });

    res.status(201).send(post);
  },
);

export { router as NewPostRouter };

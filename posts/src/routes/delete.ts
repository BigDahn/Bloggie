import {
  NotAuthorizedError,
  NotFoundError,
  RequireAuth,
} from '@bloggie/library';
import express, { Request, Response } from 'express';
import { Post } from '../models/posts';
import { PostDeletedPublisher } from '../events/publishers/post-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/posts/:id',
  RequireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post || post.isDeleted) {
      throw new NotFoundError('Post not Found');
    }

    if (post.userId !== req.user!.id) {
      throw new NotAuthorizedError('Not Authorized to delete this post');
    }
    post.isDeleted = true;
    await post.save();

    // publish an event to show the deleted post

    new PostDeletedPublisher(natsWrapper.client).publish({
      postId: post.id,
    });

    res.status(200).send();
  },
);

export { router as DeletePostRouter };

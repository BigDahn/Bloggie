import express, { Request, Response } from 'express';
import { Comment } from '../models/comments';

const router = express.Router();

router.get(
  '/api/posts/:postId/comments',
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const comments = await Comment.find({
      postId,
      isDeleted: false,
    }).sort({ createdAt: 1 });

    const commentMap = new Map(
      comments.map((c) => [c.id, { ...c.toJSON(), replies: [] as any[] }]),
    );

    const rootComments: any[] = [];

    for (const comment of commentMap.values()) {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(comment);
        } else {
          rootComments.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    }

    res.status(200).send(rootComments);
  },
);

export { router as GetCommentRouter };

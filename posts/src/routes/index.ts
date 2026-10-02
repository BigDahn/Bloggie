import { NotFoundError, RequireAuth } from '@bloggie/library';
import express, { Request, Response } from 'express';
import { Post } from '../models/posts';

const router = express.Router();

router.get('/api/posts', RequireAuth, async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
  const skip = (page - 1) * limit;

  const sortOptions: Record<string, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    mostCommented: { commentCount: -1 },
    mostLiked: { likeCount: -1 },
  };
  const sort = sortOptions[req.query.sortBy as string] ?? sortOptions.newest;

  const filter: Record<string, any> = {};

  if (req.query.search) {
    const searchTerm = req.query.search as string;
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { authorName: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter).sort(sort).skip(skip).limit(limit),
    Post.countDocuments(filter),
  ]);

  res.status(200).send({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export { router as GetPostRouter };

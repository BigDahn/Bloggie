import express from 'express';
import { Like } from '../models/likes';
import { Post } from '../models/posts';
import { isDuplicateKeyError } from '../utils/mongo-error';

const router = express.Router();

router.post('/api/posts/:postId/like', async (req, res) => {
  const postId = req.params.postId;
  try {
    await Like.build({
      postId: postId,
      userId: req.user!.id,
    }).save();
    await Post.updateOne({ _id: postId }, { $inc: { likeCount: 1 } });
    res.sendStatus(200);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res
        .status(400)
        .send({ error: 'You have already liked this post' });
    }
    throw error;
  }
});

export { router as LikeRouter };

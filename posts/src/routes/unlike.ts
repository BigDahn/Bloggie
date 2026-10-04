import express from 'express';
import { Like } from '../models/likes';
import { Post } from '../models/posts';

const router = express.Router();

router.delete('/api/posts/:postId/unlike', async (req, res) => {
  const postId = req.params.postId;

  const like = await Like.findOne({ postId, userId: req.user!.id });
  if (!like) {
    return res.status(404).send({ error: 'Like not found' });
  }

  await Post.updateOne({ _id: postId }, { $inc: { likeCount: -1 } });
  await like.deleteOne();

  res.sendStatus(200);
});

export { router as unLikeRouter };

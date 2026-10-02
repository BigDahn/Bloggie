import mongoose from "mongoose";
import { app } from "../../app";
import request from "supertest";
import { Comment } from "../../models/comments";

const commentsBuilder = async () => {
  const postId = new mongoose.Types.ObjectId().toHexString();
  const comment = Comment.createComment({
    userId: new mongoose.Types.ObjectId().toHexString(),
    postId: postId,
    comment: "What a nice post. So interesting to read",
  });
  await comment.save();

  const moreComment = Comment.createComment({
    userId: new mongoose.Types.ObjectId().toHexString(),
    postId,
    comment: "Like fr this is a very good post",
    parentCommentId: comment.id,
  });

  await moreComment.save();

  return { comment, postId };
};

it("fetches all the comments in a particular post", async () => {
  const { postId } = await commentsBuilder();
  await request(app).get(`/api/posts/${postId}/comments`).expect(200);
});

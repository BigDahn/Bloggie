import mongoose from 'mongoose';

interface LikeAttrs {
  postId: string;
  userId: string;
}

interface LikeDoc extends mongoose.Document {
  postId: string;
  userId: string;
}

interface LikeModel extends mongoose.Model<LikeDoc> {
  build(attrs: LikeAttrs): LikeDoc;
}

const likeSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

likeSchema.index({ postId: 1, userId: 1 }, { unique: true }); // Ensure a user can like a post only once

likeSchema.statics.build = (attrs: LikeAttrs) => {
  return new Like(attrs);
};

const Like = mongoose.model<LikeDoc, LikeModel>('Like', likeSchema);

export { Like };

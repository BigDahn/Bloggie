import mongoose from 'mongoose';

interface PostAttrs {
  postId: string;
}

interface PostDocs extends mongoose.Document {
  postId: string;
  isDeleted: boolean;
}

interface PostModel extends mongoose.Model<PostDocs> {
  createPost(attrs: PostAttrs): PostDocs;
}

const postSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

postSchema.statics.createPost = (attrs: PostAttrs) => {
  return new Post(attrs);
};

const Post = mongoose.model<PostDocs, PostModel>('Post', postSchema);

export { Post };

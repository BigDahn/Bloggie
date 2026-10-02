import mongoose from 'mongoose';

interface PostAttrs {
  userId: string;
  authorName: string;
  title: string;
  excerpt: string;
  content: string;
}

interface PostDoc extends mongoose.Document {
  id: string;
  userId: string;
  authorName: string;
  excerpt: string;
  title: string;
  content: string;
  likeCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
}

interface PostModel extends mongoose.Model<PostDoc> {
  createPost(attrs: PostAttrs): PostDoc;
}

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc: any, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);
postSchema.index({ isDeleted: 1, createdAt: -1 });
postSchema.index({ isDeleted: 1, commentCount: -1 });
postSchema.index({ isDeleted: 1, likeCount: -1 });
postSchema.index({ userId: 1 });
postSchema.statics.createPost = (attrs: PostAttrs) => {
  return new Post(attrs);
};

const Post = mongoose.model<PostDoc, PostModel>('Post', postSchema);

export { Post };

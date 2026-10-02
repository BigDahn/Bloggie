import mongoose from 'mongoose';

interface CommentAttrs {
  postId: string;
  comment: string;
  userId: string;
  parentCommentId?: string;
}

interface CommentDocs extends mongoose.Document {
  id: string;
  postId: string;
  comment: string;
  userId: string;
  parentCommentId?: string;
  isDeleted: Boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommentModel extends mongoose.Model<CommentDocs> {
  createComment(attrs: CommentAttrs): CommentDocs;
}

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
      required: true,
    },
    parentCommentId: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

commentSchema.statics.createComment = (attrs: CommentAttrs) => {
  return new Comment(attrs);
};

const Comment = mongoose.model<CommentDocs, CommentModel>(
  'Comment',
  commentSchema,
);

export { Comment };

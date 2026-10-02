import mongoose from 'mongoose';

interface RefreshAttrs {
  userId: string;
  refreshToken: string;
  revoked: boolean;
  expiresAt: Date;
}

interface RefreshDoc extends mongoose.Document {
  userId: string;
  refreshToken: string;
  revoked: boolean;
  expiresAt: Date;
}

interface RefreshModel extends mongoose.Model<RefreshDoc> {
  createRefresh(attrs: RefreshAttrs): RefreshDoc;
}

const refreshSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc: any, ret: Record<string, any>) {
        delete ret._id;
      },
    },
  },
);

refreshSchema.statics.createRefresh = (attrs: RefreshAttrs) => {
  return new Refresh(attrs);
};

const Refresh = mongoose.model<RefreshDoc, RefreshModel>(
  'Refresh',
  refreshSchema,
);

export { Refresh };

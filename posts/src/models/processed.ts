import mongoose from 'mongoose';

interface processedEventAttr {
  commentId: string;
}

interface processedEventDoc extends mongoose.Document {
  id: string;
  commentId: string;
  processedAt: Date;
}

interface processedEventModel extends mongoose.Model<processedEventDoc> {
  createProcessedEvent(attrs: processedEventAttr): Promise<processedEventDoc>;
}

const processedEventSchema = new mongoose.Schema(
  {
    commentId: {
      type: String,
      required: true,
      unique: true,
    },
    processedAt: { type: Date, default: Date.now },
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

processedEventSchema.statics.createProcessedEvent = async (
  attrs: processedEventAttr,
) => {
  const processEvent = new ProcessedEvent(attrs);
  return await processEvent.save();
};

const ProcessedEvent = mongoose.model<processedEventDoc, processedEventModel>(
  'ProcessedEvent',
  processedEventSchema,
);

export { ProcessedEvent };

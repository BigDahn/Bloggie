import { CommentCreatedEvent, Listener, Subjects } from '@bloggie/library';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { Post } from '../../models/posts';
import { ProcessedEvent } from '../../models/processed';
import { isDuplicateKeyError } from '../../utils/mongo-error';

export class CommentCreatedListener extends Listener<CommentCreatedEvent> {
  readonly subject = Subjects.CommentCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: CommentCreatedEvent['data'], msg: Message) {
    try {
      await ProcessedEvent.createProcessedEvent({
        commentId: data.commentId,
      });
      await Post.updateOne({ _id: data.postId }, { $inc: { commentCount: 1 } });
      msg.ack();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        msg.ack();
        return;
      }

      throw error;
    }
  }
}

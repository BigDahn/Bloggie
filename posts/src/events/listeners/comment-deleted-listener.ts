import { Listener, CommentDeletedEvent, Subjects } from '@bloggie/library';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from '../queueGroupName';
import { ProcessedEvent } from '../../models/processed';
import { Post } from '../../models/posts';
export class CommentDeletedListener extends Listener<CommentDeletedEvent> {
  readonly subject = Subjects.CommentDeleted;
  queueGroupName = queueGroupName;
  async onMessage(data: CommentDeletedEvent['data'], msg: Message) {
    const processedEventId = await ProcessedEvent.findOne({
      commentId: data.commentId,
    });
    if (!processedEventId) {
      return msg.ack();
    }
    await Post.updateOne({ _id: data.postId }, { $inc: { commentCount: -1 } });
    await processedEventId.deleteOne();

    msg.ack();
  }
}

import { Message, Stan } from 'node-nats-streaming';

interface Events {
  subject: string;
  data: any;
}

export abstract class Listener<T extends Events> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  protected ackWait = 5 * 1000;
  private client: Stan;
  abstract onMessage(data: T['data'], msg: Message): void;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions(),
    );
    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject}/${this.queueGroupName}`);

      const parsedData = this.parsedMsg(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parsedMsg(msg: Message) {
    const data = msg.getData();

    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf-8'));
  }
}

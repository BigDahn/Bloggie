import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('CANNOT ACCESS NATS CLIENT BEFORE CONNECTING');
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    const client = this._client;

    return new Promise<void>((resolve, reject) => {
      client.on('connect', () => {
        console.log('NATS CONNECTED SUCCESSFULLY');
        resolve();
      });

      client.on('error', (error) => {
        console.log('NATS CONNECTION FAILED');
        console.log(error);
        reject();
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();

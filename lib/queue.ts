import { SQS } from 'aws-sdk';
import { Collection } from '../types/collection';

const { COLLECTIONS_QUEUE_NAME, BACKOFF_MULTIPLIER } = process.env;

export class Queue {
  public static async add(collection: Collection): Promise<void> {
    const client = new SQS({ region: 'eu-west-1' });

    const delay = 2 ** (collection.attempt || 0) * Number(BACKOFF_MULTIPLIER);

    const params: SQS.SendMessageRequest = {
      QueueUrl: COLLECTIONS_QUEUE_NAME as string,
      MessageBody: JSON.stringify(collection),
      DelaySeconds: delay,
    };
  
    console.debug({ msg: 'Adding collection payload to SQS', params });
  
    await client.sendMessage(params).promise();
  }
}

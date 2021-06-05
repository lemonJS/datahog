import { SQS } from 'aws-sdk';
import { Collection } from '../types/collection';

const { COLLECTIONS_QUEUE_NAME, BACKOFF_MULTIPLIER } = process.env;

export class Queue {
  /**
   * Add the collection onto the queue for it to be picked
   * up by the subscriber Lambda. The number of failed attempts
   * will determine how long it will wait in the queue for.
   * @param {Collection} collection 
   * @return {Promise<void>}
   */
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

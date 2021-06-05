import pino from 'pino';
import { SQS } from 'aws-sdk';
import { Collection } from '../types/collection';

const logger = pino();
const { COLLECTIONS_QUEUE_NAME, BACKOFF_MULTIPLIER, REGION } = process.env;

export class Queue {
  /**
   * Add the collection onto the queue for it to be picked
   * up by the subscriber Lambda. The number of failed attempts
   * will determine how long it will wait in the queue for.
   * @param {Collection} collection 
   * @return {Promise<void>}
   */
  public static async add(collection: Collection): Promise<void> {
    const client = new SQS({ region: REGION as string });

    const delay = (collection.attempt || 0) * Number(BACKOFF_MULTIPLIER);

    const params: SQS.SendMessageRequest = {
      QueueUrl: COLLECTIONS_QUEUE_NAME as string,
      MessageBody: JSON.stringify(collection),
      DelaySeconds: delay
    };
  
    logger.info({ msg: 'Adding collection payload to SQS', params });
  
    await client.sendMessage(params).promise();
  }
}

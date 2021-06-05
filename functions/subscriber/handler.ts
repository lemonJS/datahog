import pino from 'pino';
import { SQSEvent } from 'aws-lambda';
import { Queue } from '../../lib/queue';
import { Http } from '../../lib/http';
import { MaxAttemptsReachedError } from '../../lib/errors';
import type { Collection } from '../../types/collection';

const logger = pino();
const { MAX_BACKOFF_ATTEMPTS } = process.env;

/**
 * Pick events from the SQS queue and attempt to call the providers
 * API. If the request succeeds then no more action is taken. If the 
 * request fails we will add it back on the queue with a longer delay
 * with the hope that the API will be working later. If it fails N 
 * amount of times, we place the message on the DLQ to be inspected
 * manually.
 * @param {SQSEvent} event 
 * @return {Promise<void>}
 */
export const handle = async (event: SQSEvent): Promise<void> => {
  // The batch size is configured for 1, so we can safetly
  // operate on the 0th item
  const collection = <Collection>JSON.parse(event.Records[0]!.body);
  
  logger.info({ msg: 'Processing collection', collection });

  try {
    // Get the list of bills using the provider from the collection,
    // and send them to the callbackUrl. Either of these can be flaky!
    const http = new Http(collection);
    await http.handleBillCollection();
  } catch(error) {
    logger.error({ msg: 'Failed to process collection', collection, error: error.stack });

    // Attempt is not always defined so it needs to be guarded against
    collection.attempt = collection.attempt 
      ? collection.attempt + 1 
      : 1;

    if (collection.attempt > Number(MAX_BACKOFF_ATTEMPTS)) {
      throw new MaxAttemptsReachedError();
    }
    
    await Queue.add(collection);
  }
};

import { SQSEvent } from 'aws-lambda';
import { Queue } from '../../lib/queue';
import { Http } from '../../lib/http';
import type { Collection } from '../../types/collection';

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
  
  console.debug({ msg: 'Processing collection', collection });

  try {
    // Get the list of bills using the provider from the collection,
    // and send them to the callbackUrl. Either of these can be flaky!
    await new Http(collection).handleBillCollection();
  } catch(error) {
    console.error({ msg: 'Failed to process collection', collection });

    // Attempt is not always defined so it needs to be guarded against
    collection.attempt = collection.attempt 
      ? collection.attempt + 1 
      : 1;

    if (collection.attempt > 10) { // TODO
      throw new Error('Max attempts reached');
    }
    
    await Queue.add(collection);
  }
};

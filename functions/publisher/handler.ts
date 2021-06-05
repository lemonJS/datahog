import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Queue } from '../../lib/queue';
import { Collection } from '../../types/collection';

/**
 * Accept proxy events from ApiGateway and place the body on a queue
 * to be picked up by the subscriber Lambda. The event body has already
 * been validated at this point, so it is safe to make assumptions about
 * the shape of the data.
 * @param {APIGatewayProxyEvent} event 
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const collection = <Collection>JSON.parse(event.body!);

  await Queue.add(collection);

  return {
    statusCode: 202,
    body: JSON.stringify({ message: 'Accepted' })
  };
};

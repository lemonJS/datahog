import { invokeLocalLambda, createCollection } from '../../utils';
import { Queue } from '../../../lib/queue';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

describe('Handling events in the publisher Lambda', () => {
  const collection = createCollection();

  const event = { body: JSON.stringify(collection) } as APIGatewayProxyEvent;

  beforeAll(() => {
    Queue.add = jest.fn();
  });

  it('returns a 202 Accepted status code', async () => {
    const response = await invokeLocalLambda<APIGatewayProxyEvent, APIGatewayProxyResult>('publisher', event);

    expect(response).toEqual({
      statusCode: 202,
      body: JSON.stringify({ message: 'Accepted' }),
    });
  });

  it('places the event body onto the queue', async () => {
    await invokeLocalLambda<APIGatewayProxyEvent, APIGatewayProxyResult>('publisher', event);

    expect(Queue.add).toHaveBeenCalledWith(collection);
  });
});

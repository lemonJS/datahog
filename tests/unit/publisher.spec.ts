import Chance from 'chance';
import { invokeLocalLambda } from '../utils';
import { Queue } from '../../lib/queue';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const chance = Chance();

describe('Handling events in the publisher Lambda', () => {
  const collection = {
    provider: chance.pickone(['gas', 'electric']),
    callbackUrl: chance.url(),
  };

  const event = { body: JSON.stringify(collection) } as APIGatewayProxyEvent;

  beforeAll(() => {
    Queue.add = jest.fn();
  });

  it('returns a 202 Accepted status code', async () => {
    const response = await invokeLocalLambda<APIGatewayProxyEvent, APIGatewayProxyResult>('publisher', event);

    expect(response).toEqual({
      statusCode: 202,
      body: JSON.stringify({ status: 'Accepted' }),
    });
  });

  it('places the event body onto the queue', async () => {
    await invokeLocalLambda<APIGatewayProxyEvent, APIGatewayProxyResult>('publisher', event);

    expect(Queue.add).toHaveBeenCalledWith(collection);
  });
});

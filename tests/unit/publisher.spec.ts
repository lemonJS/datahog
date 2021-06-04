import Chance from 'chance';
import { invokeLocalLambda, stubSqsSendMessage } from '../utils';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const chance = Chance();

describe('Handling events in the publisher Lambda', () => {
  const stub = jest.fn();

  const collection = JSON.stringify({
    provider: chance.pickone(['gas', 'electric']),
    callbackUrl: chance.url(),
  });

  const event = { body: collection } as APIGatewayProxyEvent;

  beforeAll(() => {
    stubSqsSendMessage(stub);
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

    expect(stub).toHaveBeenCalledWith({
      QueueUrl: process.env.COLLECTIONS_QUEUE_NAME,
      MessageBody: collection,
      DelaySeconds: 0,
    });
  });
});

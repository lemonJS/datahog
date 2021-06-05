import Chance from 'chance';
import AWS from 'aws-sdk-mock';
import { SQS } from 'aws-sdk';
import { Collection } from '../types/collection';
import { Bill } from '../types/bill';

const chance = Chance();

export const invokeLocalLambda = async <Event, Response>(
  path: 'publisher' | 'subscriber', 
  event: Event
): Promise<Response> => {
  const handler = require(`../functions/${path}/handler`).handle;
  return handler(event);
};

export const stubSqsSendMessage = (stub: jest.Mock) => {
  AWS.mock('SQS', 'sendMessage', (params: SQS.SendMessageBatchRequest, callback: Function) => { 
    stub(params);
    callback(null);
  });
};

export const createCollection = (args: Partial<Collection> = {}): Collection => {
  return {
    provider: chance.pickone(['gas', 'internet']),
    callbackUrl: chance.url(),
    ...args,
  };
};

export const createBills = (): Bill[] => {
  return [
    {
      amount: chance.integer(),
      billedOn: chance.date().toISOString(),
    },
    {
      amount: chance.integer(),
      billedOn: chance.date().toISOString(),
    }
  ]
};

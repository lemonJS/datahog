import AWS from 'aws-sdk-mock';
import { SQS } from 'aws-sdk';

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

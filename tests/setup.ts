import AWS from 'aws-sdk';
import AWSMock from 'aws-sdk-mock';

export default async (): Promise<void> => {
  AWSMock.setSDKInstance(AWS);

  process.env.BACKOFF_MULTIPLIER = '90';
  process.env.MAX_BACKOFF_ATTEMPTS = '10';
  process.env.COLLECTIONS_QUEUE_NAME = '__test__';
};

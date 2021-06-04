import AWS from 'aws-sdk';
import AWSMock from 'aws-sdk-mock';

export default async (): Promise<void> => {
  AWSMock.setSDKInstance(AWS);

  process.env.COLLECTIONS_QUEUE_NAME = '__test__';
};

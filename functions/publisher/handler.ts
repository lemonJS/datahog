import { SQS } from 'aws-sdk';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const { COLLECTIONS_QUEUE_NAME } = process.env;

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const client = new SQS({ region: 'eu-west-1' });

  const params: SQS.SendMessageRequest = {
    QueueUrl: COLLECTIONS_QUEUE_NAME as string,
    // The body is validated by ApiGateway
    MessageBody: event.body!,
    // The first message can be processed straight away
    // and doesn't need to be backed off
    DelaySeconds: 0,
  };

  console.debug({ msg: 'Adding collection payload to SQS', params });

  await client.sendMessage(params).promise();

  return {
    statusCode: 202,
    body: JSON.stringify({ status: 'Accepted' }),
  };
};

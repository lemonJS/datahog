# Options

### Option 1

This option utlises the `DelaySeconds` feature in SQS. 

Incoming payloads are validated by ApiGateway before they are handed off to a Lambda function that places the messages onto the queue. The messages will be picked up quickly by the processing Lambda, which will attempt to contact the provider to fetch the data. If the request is successful, then the `callbackUrl` will be called and the process is complete. If the request fails, then the exception is gracefully handled, and the message placed back on the queue with an exponentially backed off delay.

Shoud the message fail to be handled after a given amount of attempts, an error will be thrown to place the message onto the DLQ. If the `callbackUrl` fails then the message will also end up on the DLQ.

Cloudwatch alarms can be configured for both error scenarios as these will likely require human involvement.

TODO: Insert diagram

### Option 2

This option utilises Cloudwatch events as a way of polling for retries.

Similarly to option 1, the payloads will be validated by ApiGateway and handed off to a Lambda function. The function will create an item in Dynamo with an `attemptAfter` timestamp (likely having a Global Secondary Index). 

Cloudwatch events will trigger another Lambda function periodically which will query for all items which are due to be tried. The query would look something like this:

```typescript
const params: DynamoDB.DocumentClient.QueryInput = {
  TableName: '...',
  IndexName: 'attempt_after_index',
  KeyConditionExpression: 'attemptAfter <= :now',
  ExpressionAttributeValues: {
    ':now': new Date().valueOf()
  }
};

const { Items } = await client.query(params).promise();
```

Should the attempt to call the provider fail, the Lambda will update the item and increate the `attemptAfter` value exponentially so that it will be picked up another time.

TODO: Insert diagram

### Decision

Option 1 is slighly more complicated, but is a far more scalable option for the following reasons:
- Each payload in option 1 is responsible for itself and scales infinitely. Option 2 would require batching once the amount of items returned by the query grows
- Option 1 has the safety of the DLQ, which provides security against data loss

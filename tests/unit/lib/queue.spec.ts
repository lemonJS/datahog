import { Queue } from '../../../lib/queue';
import { stubSqsSendMessage, createCollection } from '../../utils';
import { Collection } from '../../../types/collection';

const { COLLECTIONS_QUEUE_NAME } = process.env;

describe('Queue', () => {
  const stub = jest.fn();

  beforeAll(() => {
    stubSqsSendMessage(stub);
  });

  describe('.add', () => {
    describe.each`
      attempt | expected
      ${0}    | ${0}
      ${1}    | ${90}
      ${2}    | ${180}
      ${3}    | ${270}
      ${4}    | ${360}
      ${5}    | ${450}
      ${6}    | ${540}
      ${7}    | ${630}
      ${8}    | ${720}
      ${9}    | ${810}
      ${10}   | ${900}
    `('Queueing messages with $attempt attempts', ({ attempt, expected }) => {
      const collection = createCollection({ attempt });

      it('uses the correct delay amount', async () => {
        await Queue.add(collection as Collection);
        
        expect(stub).toHaveBeenCalledWith(expect.objectContaining({
          DelaySeconds: expected,
        }));
      });
    });

    it('includes the payload in the event body', async () => {
      const collection = createCollection();

      await Queue.add(collection);

      expect(stub).toHaveBeenCalledWith({
        QueueUrl: COLLECTIONS_QUEUE_NAME as string,
        MessageBody: JSON.stringify(collection),
        DelaySeconds: 0,
      });
    });
  });
});

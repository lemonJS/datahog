import type { SQSEvent } from 'aws-lambda';
import { invokeLocalLambda, createCollection } from '../../utils';
import { Http } from '../../../lib/http';
import { Queue } from '../../../lib/queue';
import { MaxAttemptsReachedError } from '../../../lib/errors';

const { MAX_BACKOFF_ATTEMPTS } = process.env;

describe('Processing messages from the SQS queue', () => {
  describe('when the `handleBillCollection` method fails', () => {
    const collection = createCollection();
    
    const event = { Records: [{ body: JSON.stringify(collection) }] } as SQSEvent;

    beforeAll(() => {
      Queue.add = jest.fn();

      Http.prototype.handleBillCollection = jest.fn(() => {
        throw new Error();
      });
    });

    it('adds the message to the queue', async () => {
      await invokeLocalLambda<SQSEvent, void>('subscriber', event);

      expect(Queue.add).toHaveBeenCalledWith({ ...collection, attempt: 1 });
    });
  });

  describe('when too many attempts have been made and there is an error', () => {
    const collection = createCollection({ attempt: Number(MAX_BACKOFF_ATTEMPTS) });
    
    const event = { Records: [{ body: JSON.stringify(collection) }] } as SQSEvent;

    beforeAll(() => {
      Queue.add = jest.fn();

      Http.prototype.handleBillCollection = jest.fn(() => {
        throw new Error();
      });
    });

    it('the error is not caught', async () => {
      expect(invokeLocalLambda<SQSEvent, void>('subscriber', event))
        .rejects.toThrowError(MaxAttemptsReachedError);
    });

    it('does not add the message back onto the queue', async () => {
      await invokeLocalLambda<SQSEvent, void>('subscriber', event).catch(() => {
        expect(Queue.add).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the data is fetched and called back successfully', () => {
    const collection = createCollection();

    const event = { Records: [{ body: JSON.stringify(collection) }] } as SQSEvent;

    beforeAll(() => {
      Queue.add = jest.fn();
      Http.prototype.handleBillCollection = jest.fn();
    });

    it('resolves without an error', async () => {
      const response = await invokeLocalLambda<SQSEvent, void>('subscriber', event);
      expect(response).toBeUndefined();
    });

    it('does not add the message back onto the queue', async () => {
      await invokeLocalLambda<SQSEvent, void>('subscriber', event).catch(() => {
        expect(Queue.add).not.toHaveBeenCalled();
      });
    });
  });
});

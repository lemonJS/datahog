import Chance from 'chance';
import type { SQSEvent } from 'aws-lambda';
import { invokeLocalLambda } from '../../utils';
import { Http } from '../../../lib/http';
import { Queue } from '../../../lib/queue';

const chance = Chance();

describe('Processing messages from the SQS queue', () => {
  describe('when the `handleBillCollection` method fails', () => {
    const collection = {
      provider: chance.pickone(['gas', 'electric']),
      callbackUrl: chance.url(),
    };
    
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
    const collection = {
      provider: chance.pickone(['gas', 'electric']),
      callbackUrl: chance.url(),
      attempt: 10,
    };
    
    const event = { Records: [{ body: JSON.stringify(collection) }] } as SQSEvent;

    beforeAll(() => {
      Queue.add = jest.fn();

      Http.prototype.handleBillCollection = jest.fn(() => {
        throw new Error();
      });
    });

    it('the error is not caught', async () => {
      expect(invokeLocalLambda<SQSEvent, void>('subscriber', event))
        .rejects.toThrowError('Max attempts reached');
    });

    it('does not add the message back onto the queue', async () => {
      await invokeLocalLambda<SQSEvent, void>('subscriber', event).catch(() => {
        expect(Queue.add).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the data is fetched and called back successfully', () => {
    const collection = {
      provider: chance.pickone(['gas', 'electric']),
      callbackUrl: chance.url(),
    };

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

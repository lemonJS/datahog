import fetch from 'node-fetch';
import { Http } from '../../../lib/http';
import { createCollection, createBills } from '../../utils';
import { BillProviderUnavailableError, CallbackUrlUnavailableError } from '../../../lib/errors';

jest.mock('node-fetch');

describe('Http', () => {
  describe('constructor', () => {
    it('instantiates with the collection payload', () => {
      const collection = createCollection();

      const http = new Http(collection);
      expect(http).toBeInstanceOf(Http);
    });
  });

  describe('.handleBillCollection', () => {
    const collection = createCollection();
    const http = new Http(collection);
    const bills = createBills();
    const stub = jest.fn();

    beforeAll(() => {
      jest.spyOn(http, 'fetchBills' as any).mockImplementation(async () => bills);
      jest.spyOn(http, 'callbackBillData' as any).mockImplementation(stub);
    });

    it('forwards the response from the bill method to the callback method', async () => {
      await http.handleBillCollection();
      expect(stub).toHaveBeenCalledWith(bills);
    });
  });

  describe('.fetchBills', () => {
    describe('when the request fails', () => {
      const collection = createCollection();
      const http = new Http(collection);

      beforeAll(() => {
        (fetch as any).mockImplementation(() => ({
          ok: false,
          text: () => 'Internal Server Error',
        }));
      });

      it('throws an error', () => {
        expect((http as any).fetchBills())
          .rejects.toThrowError(BillProviderUnavailableError);
      });
    });

    describe('when the request succeeds', () => {
      const collection = createCollection();
      const http = new Http(collection);
      const bills = createBills();

      beforeAll(() => {
        (fetch as any).mockImplementation(() => ({
          ok: true,
          json: async () => bills,
        }));
      });

      it('returns the json response', async () => {
        const response = await (http as any).fetchBills();
        expect(response).toEqual(bills);
      });
    });
  });

  describe('.callbackBillData', () => {
    describe('when the request fails', () => {
      const collection = createCollection();
      const http = new Http(collection);

      beforeAll(() => {
        (fetch as any).mockImplementation(() => ({
          ok: false,
          text: () => 'Internal Server Error',
        }));
      });

      it('throws an error', () => {
        expect((http as any).callbackBillData())
          .rejects.toThrowError(CallbackUrlUnavailableError);
      });
    });

    describe('when the request succeeds', () => {
      const collection = createCollection();
      const http = new Http(collection);

      beforeAll(() => {
        (fetch as any).mockImplementation(() => ({
          ok: true,
        }));
      });

      it('resolves without errors', async () => {
        const response = await (http as any).callbackBillData();
        expect(response).toBe(undefined);
      });
    });
  });
});

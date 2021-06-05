import pino from 'pino';
import fetch from 'node-fetch';
import type { Bill } from '../types/bill';
import type { Collection } from '../types/collection';
import { BillProviderUnavailableError, CallbackUrlUnavailableError } from './errors';

const logger = pino();
const { PROVIDER_API_BASE_URL } = process.env;

export class Http {
  public constructor(public collection: Collection) {
    this.collection = collection;
  }

  /**
   * First call the provider API to get the bill data and
   * then send it back to the callbackUrl
   * @return {Promise<void>}
   */
  public async handleBillCollection(): Promise<void> {
    const bills = await this.fetchBills();
    await this.callbackBillData(bills);
  }

  /**
   * Fetch the bills from the provider API using the provider
   * from the collection payload
   * @returns {Promise<Bill[]>}
   */
  private async fetchBills(): Promise<Bill[]> {
    const response = await fetch(this.billUrl);

    if (!response.ok) {
      logger.warn({ msg: 'Bill provider unavailable', collection: this.collection });
      throw new BillProviderUnavailableError(response.statusText);
    }

    const bills = response.json();

    logger.info({ msg: 'Fetched bill information', collection: this.collection, bills })

    return bills;
  }

  /**
   * Use the callbackUrl from the collection to POST the bill
   * data. If it should fail we raise an error to retry at a
   * later date
   * @param {Bill[]} bills 
   * @return {Promise<void>}
   */
  private async callbackBillData(bills: Bill[]): Promise<void> {
    const response = await fetch(this.collection.callbackUrl, {
      method: 'POST',
      body: JSON.stringify(bills),
    });

    if (!response.ok) {
      logger.warn({ msg: 'Callback URL unavailable', collection: this.collection });
      throw new CallbackUrlUnavailableError(response.statusText);
    }

    logger.info({ msg: 'Bill data called back successfully', collection: this.collection, bills });
  }

  private get billUrl() {
    return `${PROVIDER_API_BASE_URL}/providers/${this.collection.provider}`;
  }
}

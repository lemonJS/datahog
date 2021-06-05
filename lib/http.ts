import type { Bill } from '../types/bill';
import type { Collection } from '../types/collection';

export class Http {
  public constructor(public collection: Collection) {
    this.collection = collection;
  }

  public async handleBillCollection(): Promise<void> {
    const bills = await this.fetchBills();
    await this.callbackBillData(bills);
  }

  private async fetchBills(): Promise<Bill[]> {
    return [];
  }

  private async callbackBillData(_bills: Bill[]): Promise<void> {

  }
}

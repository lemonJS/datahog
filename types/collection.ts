export interface Collection {
  provider: 'gas' | 'internet';
  callbackUrl: string;
  attempt?: number;
}

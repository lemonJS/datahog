import { Bill } from '../../types/bill';

export type Providers = {
  gas: Bill[];
  internet: Bill[];
}

export const providers: Providers = {
  gas: [
    {
      billedOn: "2020-04-07T15:03:14.257Z",
      amount: 22.27,
    },
    {
      billedOn: "2020-05-07T15:03:14.257Z",
      amount: 30.00,
    }
  ],
  internet: [
    {
      billedOn: "2020-02-07T15:03:14.257Z",
      amount: 15.12,
    },
    {
      billedOn: "2020-03-07T15:03:14.257Z",
      amount: 15.12,
    }
  ]
};

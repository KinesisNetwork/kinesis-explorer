import { AccountRecord } from 'js-kinesis-sdk'
import moment from 'moment'

export function flatten<T>(...items: Array<T | T[]>): T[] {
  return ([] as T[]).concat(...items)
}

export function renderRelativeDate(date: Date | string): string {
  const parsedDate = moment(date, moment.ISO_8601)
  return moment(parsedDate).fromNow()
}

export function renderAmount(amount: string | number, precision: number = 5) {
  return ((Number(amount) > 999999999) && precision == 7) ?
    (amount).toLocaleString(undefined, {
      useGrouping: true, maximumFractionDigits: precision, minimumFractionDigits: 0,
    }) :
    Number(amount).toLocaleString(undefined, {
      useGrouping: true, maximumFractionDigits: precision, minimumFractionDigits: 0,
    })
}

export function isEqual(a: any, b: any): boolean {
  return Object.is(a, b)
}

export function log<T>(x: T, tag?: string | number): T {
  // tslint:disable-next-line:no-console
  console.log(tag, x)
  return x
}

export function sum(a: number, b: number): number {
  return a + b
}

export const createEmptyBalanceAccountRecord = (accountId: string) => ({
  id: accountId,
  paging_token: '',
  account_id: accountId,
  sequence: 0,
  subentry_count: 0,
  thresholds: {
    low_threshold: 0,
    med_threshold: 0,
    high_threshold: 0,
  },
  flags: {
    auth_required: false,
    auth_revocable: false,
  },
  balances: [
    {
      balance: '0.0',
      asset_type: 'native',
    },
  ],
  _links: {},
  signers: [
    {
      public_key: accountId,
      weight: 0,
    },
  ],
  data: {},
  effects: () =>
    Promise.resolve({ records: [], next: () => Promise.resolve(), prev: () => Promise.resolve() } as any),
  offers: () => Promise.resolve({ records: [], next: () => Promise.resolve(), prev: () => Promise.resolve() } as any),
  operations: () =>
    Promise.resolve({ records: [], next: () => Promise.resolve(), prev: () => Promise.resolve() } as any),
  payments: () =>
    Promise.resolve({ records: [], next: () => Promise.resolve(), prev: () => Promise.resolve() } as any),
  trades: () => Promise.resolve({ records: [], next: () => Promise.resolve(), prev: () => Promise.resolve() } as any),
} as AccountRecord)

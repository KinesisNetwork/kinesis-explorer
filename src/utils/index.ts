import moment from 'moment'

export function flatten<T>(...items: Array<T | T[]>): T[] {
  return ([] as T[]).concat(...items)
}

export function renderRelativeDate(date: Date | string): string {
  const parsedDate = moment(date, moment.ISO_8601)
  return moment(parsedDate).fromNow()
}

export function renderAmount(amount: string | number) {
  return Number(amount).toLocaleString(undefined, {
    useGrouping: true,
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

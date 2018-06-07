import moment from 'moment'

export function flatten(...items: any[]): any[] {
  return [].concat(...items)
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

export function isEqual(a: any, b: any) {
  return Object.is(a, b)
}

import { OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { startCase } from 'lodash'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { renderAmount, renderRelativeDate } from '../../utils'
import { HorizontalLabelledField } from '../shared'

let currConn: string

const BASE_OPERATION_KEYS = [
  'id',
  '_links',
  'effects',
  'paging_token',
  'precedes',
  'self',
  'succeeds',
  'transaction',
  'type',
  'type_i',
  'envelope_xdr',
  'result_xdr',
  'result_meta_xdr',
  'fee_meta_xdr',
  'into',
  'account',
]
const BASE_KEYS = ['into', 'account']

const FORMAT_VALUE: { [key: string]: (value: string) => string | number | React.ReactNode } = {
  created_at: (value) =>
    `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)} ${value.slice(11, 14)}${value.slice(
      14,
      17,
    )}${value.slice(17, 19)}`,
  source_account: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  funder: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  account: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  from: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  to: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  transaction_hash: (value) => <Link to={`/transaction/${currConn}/${value}`}>{value}</Link>,
  starting_balance: (value) => `${renderAmount(value, 7)} ${currConn}`,
  amount: (value) => `${renderAmount(value)} ${currConn}`,
}

export const OperationInfo: React.SFC<{
  selectedConnection: any,
  operation: OperationRecord | null,
  conn: string,
}> = ({ selectedConnection, operation, conn }) => {
  currConn = conn

  const fields = operation
    ? Object.entries(operation)
        .filter(([, val]) => typeof val === 'string')
        .filter(([key]) => !BASE_OPERATION_KEYS.includes(key))
        .map(([key, value]) => (FORMAT_VALUE[key] ? [key, FORMAT_VALUE[key](value)] : [key, value]))
        .map(([key, value]) => <HorizontalLabelledField key={key} label={startCase(key)} value={value} />)
    : []

  const field = operation
    ? Object.entries(operation)
        .filter(([, val]) => typeof val === 'string')
        .filter(([key]) => BASE_KEYS.includes(key))
        .map(([key, value]) => (FORMAT_VALUE[key] ? [key, FORMAT_VALUE[key](value)] : [key, value]))
        .map(([key, value]) => <HorizontalLabelledField key={key} label={startCase(key)} value={value} />)
    : []

  return (
    <div className='tile is-child box'>
      <p className='subtitle is-marginless'>{operation ? startCase(operation.type) : ''}</p>
      {fields} {field}
    </div>
  )
}

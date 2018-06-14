import { OperationRecord } from 'js-kinesis-sdk'
import { startCase } from 'lodash'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { renderAmount, renderRelativeDate } from '../../utils'
import { HorizontalLabelledField } from '../shared'

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
]

const FORMAT_VALUE: { [key: string]: (value: string) => string | number | React.ReactNode } = {
  created_at: (value) => `${value} | ${renderRelativeDate(value)}`,
  source_account: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  funder: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  account: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  from: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  to: (value) => <Link to={`/account/${value}`}>{value}</Link>,
  transaction_hash: (value) => <Link to={`/transaction/${value}`}>{value}</Link>,
  starting_balance: (value) => renderAmount(value),
  amount: (value) => renderAmount(value),
}

export const OperationInfo: React.SFC<{ operation: OperationRecord }> = ({ operation }) => {
  const fields = Object.entries(operation)
    .filter(([, val]) => typeof val === 'string')
    .filter(([key]) => !BASE_OPERATION_KEYS.includes(key))
    .map(([key, value]) => FORMAT_VALUE[key] ? [key, FORMAT_VALUE[key](value)] : [key, value])
    .map(([key, value]) => (
      <HorizontalLabelledField
        key={key}
        label={startCase(key)}
        value={value}
      />
    ))

  return (
    <div className='tile is-child box'>
      <p className='subtitle is-marginless'>{startCase(operation.type)}</p>
      {fields}
    </div>
  )
}

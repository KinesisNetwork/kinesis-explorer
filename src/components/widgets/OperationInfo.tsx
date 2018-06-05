import * as React from 'react'

import { OperationRecord } from 'js-kinesis-sdk'
import { startCase } from 'lodash'
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
  'transaction_hash',
  'type',
  'type_i',
]
export const OperationInfo: React.SFC<{ operation: OperationRecord }> = ({ operation }) => {
  const fields = Object.entries(operation)
    .filter(([, val]) => typeof val === 'string')
    .filter(([key]) => !BASE_OPERATION_KEYS.includes(key))
    .map(([key, value]) => (
      <HorizontalLabelledField
        key={key}
        label={startCase(key)}
        value={value}
        isCompact={true}
      />
    ))

  return (
    <div className='tile box is-child'>
      <p className='subtitle'>{startCase(operation.type)}</p>
      {fields}
    </div>
  )
}

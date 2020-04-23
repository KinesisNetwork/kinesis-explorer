import * as React from 'react'

import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { OperationInfo } from './OperationInfo'

interface Props {
  operations: CollectionPage<OperationRecord> | null
  transactions: TransactionRecord[] | null
}
export class OperationList extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    const operations = this.props.operations
    const transactions = this.props.transactions || []
    return (
      <React.Fragment>
        { operations ?
          operations.records.map((op, i) => <OperationInfo key={i} operation={op} transaction={null}/>) : null }
        { transactions ?
            transactions.map((op, i) => <OperationInfo key={i} operation={null} transaction={op} />) : null }
      </React.Fragment>
    )
  }
}

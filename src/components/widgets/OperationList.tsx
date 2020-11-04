import * as React from 'react'

import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { OperationInfo } from './OperationInfo'

interface Props {
  operations: CollectionPage<OperationRecord> | null,
  conn?: string,
}
export class OperationList extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    const operations = this.props.operations
    const conn = (this.props.conn == undefined ? "KAU" : this.props.conn)

    return (
      <React.Fragment>
        { operations ?
          operations.records.map(
            (operation, i) => <OperationInfo key={i} operation={operation} conn={conn} />) : null}
      </React.Fragment>
    )
  }
}

import * as React from 'react'

import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { OperationInfo } from './OperationInfo'

interface Props {
  selectedConnection: any,
  operations: CollectionPage<OperationRecord> | null,
  conn?: string
}

export class OperationList extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    // const operations = this.props.operations
    // const operations = this.inflationOperation(this.props.operations)
    // let operations = this.state.operations
    const operations = this.props.operations
    const conn = (this.props.selectedConnection === undefined ? 'KAU' : this.props.conn)
    return (
      <React.Fragment>
        {operations && operations.records && operations.records.length
          ? operations.records.map((operation, i) => (
              <OperationInfo
                key={i}
                operation={operation}
                conn={conn}
                selectedConnection={this.props.selectedConnection}
              />
            ))
          : null}
      </React.Fragment>
    )
  }
}

import * as React from 'react'

import { CollectionPage, OperationRecord } from 'js-kinesis-sdk'
import { OperationInfo } from './OperationInfo'

interface Props {
  operations: CollectionPage<OperationRecord> | null
}
export class OperationList extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    if (!this.props.operations) {
      return (<div />)
    }
    return (
      <React.Fragment>
        {this.props.operations.records.map((op, i) => <OperationInfo key={i} operation={op} />)}
      </React.Fragment>
    )
  }
}

import * as React from 'react'

import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { OperationInfo1 } from './OperaionInfo1'
import { HorizontalLabelledField } from '../shared'
import { Link } from 'react-router-dom'
import { startCase } from 'lodash'

interface Props {
  selectedConnection: any
  operations: CollectionPage<OperationRecord> | null
  conn?: string
}

export class OperationList1 extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    // const operations = this.props.operations
    // const operations = this.inflationOperation(this.props.operations)
    // let operations = this.state.operations
    const operations = this.props.operations
    const conn = this.props.selectedConnection === undefined ? 'KAU' : this.props.conn
    console.log(operations?.records[0]?.type)
    // const name = 'From'
    if (operations?.records[0]?.type === 'inflation') {
      const name = 'Source Account'
    } else {
      const name = 'To'
    }
    return (
      <React.Fragment>
        {operations && operations.records && operations.records.length
          ? operations.records.map((operation, i) => (
              <div>
                {/* <div><b>{operation.type.toUpperCase().replace('_', ' ')} </b></div> */}
                <HorizontalLabelledField label="Type" value={startCase(operation.type)} />
                <HorizontalLabelledField
                  label="Transaction Hash"
                  value={
                    <Link to={`/transaction/${conn}/${operation.transaction_hash}`}>{operation.transaction_hash}</Link>
                  }
                />
                <HorizontalLabelledField
                  label={operation?.type === 'inflation' ? 'Source Account' : 'From'}
                  value={<Link to={`/account/${operation.source_account}`}>{operation.source_account}</Link>}
                />
              </div>
            ))
          : null}
      </React.Fragment>
    )
  }
}

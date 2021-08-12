import * as React from 'react'

import {
  CollectionPage,
  OperationRecord,
} from 'js-kinesis-sdk'
import { startCase } from 'lodash'
import { Link } from 'react-router-dom'
import { HorizontalLabelledField } from '../shared'

interface Props {
  selectedConnection: any
  operations: CollectionPage<OperationRecord> | null
  conn?: string
}

export class OperationList1 extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }
  async addOperationsToTransactionArray(transactionArray) {
    const Array = ''
    const getMemoOperationUrl = this.props.operations.records[0]
    console.log(getMemoOperationUrl, 'new response.....')
    const getInflationDestinationAccount = this.props.operations.records[0]?.['source_account']
    this.props.operations['account'] = getInflationDestinationAccount
  }

  render() {
    const operations = this.props.operations
    const op = this.addOperationsToTransactionArray(operations)
    const conn = this.props.selectedConnection === undefined ? 'KAU' : this.props.conn
    console.log(operations?.records[0]?.type)
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
                <HorizontalLabelledField label='Type' value={startCase(operation.type)} />
                <HorizontalLabelledField
                  label='Transaction Hash'
                  value={
                    <Link to={`/transaction/${conn}/${operation.transaction_hash}`}>{operation.transaction_hash}</Link>}
                />
                <HorizontalLabelledField
                  label={operation?.type === 'inflation' ? 'Source Account' : 'From'}
                  value={
                    <Link to={`/account/${this.props.operations['account']}`}>{this.props.operations['account']}</Link>}
                />
              </div>
            ))
          : null}
      </React.Fragment>
    )
  }
}

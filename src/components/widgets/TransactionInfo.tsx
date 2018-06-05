import * as React from 'react'

import { CollectionPage, OperationRecord, TransactionRecord, xdr } from 'js-kinesis-sdk'
import { startCase } from 'lodash'
import { HorizontalLabelledField } from '../shared'
import { OperationInfo } from './OperationInfo'

export interface Props {
  transaction: TransactionRecord,
}
export const TransactionInfo: React.SFC<Props> = ({ transaction }) => {
  return (
    <div className='tile is-ancestor'>
      <div className='tile is-vertical is-parent'>
        <div className='tile is-child box'>
          <p className='subtitle'>Summary</p>
          <HorizontalLabelledField label='Created At' value={transaction.created_at} />
          <HorizontalLabelledField label='Fee' value={transaction.fee_paid} />
          <HorizontalLabelledField label='Ledger' value={transaction.ledger_attr} />
          <HorizontalLabelledField label='Operation Count' value={transaction.operation_count} />
          <HorizontalLabelledField label='Memo' value={transaction.memo} />
          <HorizontalLabelledField label='Source Account' value={transaction.source_account} />
        </div>
        <OperationList transaction={transaction} />
        <div className='tile is-child box'>
          <p className='subtitle'>Signatures</p>
          {transaction.signatures.map((sig, i) => (<HorizontalLabelledField key={i} label='' value={sig} />))}
        </div>
      </div>
    </div>
  )
}

interface State {
  operations: CollectionPage<OperationRecord> | null
}
export class OperationList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      operations: null,
    }
  }

  async componentDidMount() {
    const operations = await this.props.transaction.operations()
    this.setState({ operations })
  }

  render() {
    if (!this.state.operations) {
      return (<div />)
    }
    return (
      <React.Fragment>
        {this.state.operations.records.map((op, i) => <OperationInfo key={i} operation={op} />)}
      </React.Fragment>
    )
  }
}

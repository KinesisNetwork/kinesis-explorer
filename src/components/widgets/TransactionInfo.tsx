import * as React from 'react'

import { CollectionPage, OperationRecord, TransactionRecord, xdr } from 'js-kinesis-sdk'
import { startCase } from 'lodash'
import { Link } from 'react-router-dom'
import { renderAmount } from '../../utils'
import { HorizontalLabelledField } from '../shared'
import { OperationInfo } from './OperationInfo'
import { OperationList } from './OperationList'

interface Props {
  transaction: TransactionRecord,
}
interface State {
  operations: CollectionPage<OperationRecord> | null
}
export class TransactionInfo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      operations: null,
    }
  }

  loadOperations = async () => {
    const operations = await this.props.transaction.operations()
    this.setState({ operations })
  }

  componentDidMount() {
    this.loadOperations()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.transaction.id !== this.props.transaction.id) {
      this.loadOperations()
    }
  }

  render() {
    const { transaction } = this.props
    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical is-parent'>
          <div className='tile is-child box'>
            <p className='subtitle'>Summary</p>
            <HorizontalLabelledField label='Created At' value={transaction.created_at} />
            <HorizontalLabelledField label='Fee' value={renderAmount(transaction.fee_paid)} />
            <HorizontalLabelledField
              label='Ledger'
              value={<Link to={`/ledger/${transaction.ledger_attr}`}>{transaction.ledger_attr}</Link>}
            />
            <HorizontalLabelledField label='Operation Count' value={transaction.operation_count} />
            <HorizontalLabelledField label='Memo' value={transaction.memo} />
            <HorizontalLabelledField
              label='Source Account'
              value={<Link to={`/account/${transaction.source_account}`}>{transaction.source_account}</Link>}
            />
          </div>
          <OperationList operations={this.state.operations} />
          <div className='tile is-child box'>
            <p className='subtitle'>Signatures</p>
            {transaction.signatures.map((sig, i) => (<HorizontalLabelledField key={i} label='' value={sig} />))}
          </div>
        </div>
      </div>
    )
  }
}

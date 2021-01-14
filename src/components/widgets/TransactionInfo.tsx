import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { convertStroopsToKinesis } from '../../services/kinesis'
import { renderAmount } from '../../utils'
import { HorizontalLabelledField } from '../shared'
import { OperationList } from './OperationList'

interface KemFee extends TransactionRecord {
  fee_charged?: 0
}

interface Props {
  transaction: KemFee,
  conn?: string
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
    const { transaction, conn } = this.props

    const feePaid = transaction.fee_paid || Number(transaction.fee_charged)
    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical is-parent'>
          <div className='tile is-child box'>
            <p className='subtitle'>Summary</p>
            <HorizontalLabelledField label='Created At' value={transaction.created_at} />
            <HorizontalLabelledField
              label='Fee'
              value={renderAmount(convertStroopsToKinesis(feePaid))}
              appendCurr={conn}
            />
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
          <div className='tile is-child'>
            <OperationList operations={this.state.operations} conn={conn} />
          </div>
          <div className='tile is-child box'>
            <p className='subtitle'>Signatures</p>
            {transaction.signatures.map((sig, i) => (<HorizontalLabelledField key={i} label='' value={sig} />))}
          </div>
        </div>
      </div>
    )
  }
}

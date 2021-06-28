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
  conn?: string,
  selectedConnection: any
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
  loadOperations = async (operations?: any) => {
    operations = await this.props.transaction.operations()
    // this.setState({ operations })
    return [operations]
  }
  handleOperations = async (transaction?: any) => {
    if (!transaction) {
      return
    }
    let [operations] = await this.loadOperations(this.state.operations)
    let operation = this.state.operations
    if (operations && operations.records && operations.records.length > 0) {
      if (this.state.operations && Object.keys(this.state.operations) && Object.keys(this.state.operations).length) {
        operations = await this.getAccountMergedAmount(operations)
        operation['records'] = [...operations.records, ...operation['records']]
      } else {
        operations = await this.getAccountMergedAmount(operations)
        operation = operations
      }
    }
    this.setState({
      operations: operation,
    })
  }
  getAccountMergedAmount = async (operations) => {
    for (const operationsData of operations?.records) {
      const operation = operationsData
      if (operation?.type === 'account_merge') {
        const AmountMergeAddressNetwork = operation?._links.effects?.href
        const response = await fetch(`${AmountMergeAddressNetwork}?order=desc`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
        const url = await response.json()
        const getAccountMergeAmount = url?._embedded?.records[2]?.amount
        operation['amount'] = getAccountMergeAmount
      }
    }
    return operations
  }
  componentDidMount() {
    this.handleOperations(this.props.transaction)
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.transaction.id !== this.props.transaction.id) {
      this.handleOperations(this.props.transaction)
    }
  }

  render() {
    const { transaction, conn } = this.props
    const feePaid = transaction.fee_paid || Number(transaction.fee_charged)
    const precision = conn === 'KEM' ? 7 : 5
    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical is-parent'>
          <div className='tile is-child box'>
            <p className='subtitle'>Summary</p>
            <HorizontalLabelledField label='Created At' value={transaction.created_at} />
            <HorizontalLabelledField
              label='Fee'
              value={renderAmount(convertStroopsToKinesis(feePaid), precision)}
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
            <OperationList
             operations={this.state.operations}
             conn={conn}
             selectedConnection={this.props.selectedConnection}
            />
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

import {
  BaseOperationRecord,
  CollectionPage,
  CreateAccountOperationRecord,
  OperationRecord,
  TransactionRecord,
} from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { convertStroopsToKinesis } from '../../services/kinesis'
import { renderAmount } from '../../utils'
import { HorizontalLabelledField } from '../shared'
import { OperationListTransaction } from './OperationListTransaction'
let currConn: string
interface KemFee extends TransactionRecord {
  fee_charged?: 0
}
interface Props {
  transaction: KemFee
  conn?: string
  selectedConnection: any
}
interface State {
  operations: CollectionPage<OperationRecord> | null
  dataKauKag: any
  dataKauKagAccount: any
  amount: any
}
export class TransactionInfo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      operations: null,
      dataKauKag: [],
      dataKauKagAccount: [],
      amount: [],
    }
  }
  loadOperations = async (operations?: any) => {
    operations = await this.props.transaction.operations()
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
        await this.addOperationsToTransactionArray
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
  async addOperationsToTransactionArray(transactionArray) {
    let Array = ''
    const getMemoOperationUrl = this.props.transaction?._links.effects?.href
    Array = getMemoOperationUrl
    const getResponseUrl = Array.slice(0, 121)

    const response = await fetch(`${getResponseUrl}?order=desc`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
    const url = await response.json()
    if (url?._embedded?.records[2]?.type === 'account_debited') {
      const getAccountMergeAmount = url?._embedded?.records[2]?.amount
      this.props.transaction['amount'] = getAccountMergeAmount
    }
    if (url?._embedded?.records[1]?.type === 'account_debited') {
      const getAccountMergeAmount = url?._embedded?.records[1]?.amount
      this.props.transaction['amount'] = getAccountMergeAmount
    }
    if (url?._embedded?.records[0]?.type === 'account_debited') {
      const getAccountMergeAmount = url?._embedded?.records[1]?.amount
      this.props.transaction['amount'] = getAccountMergeAmount
    }
    if (url?._embedded?.records[0]?.type === 'account_credited') {
      const getAccountMergeAmount = url?._embedded?.records[0]?.amount
      this.props.transaction['amount'] = getAccountMergeAmount
    }
    if (url?._embedded?.records[1]?.type === 'account_credited') {
      const getAccountMergeAccount = url?._embedded?.records[1]?.account
      this.props.transaction['account'] = getAccountMergeAccount
    }
    if (url?._embedded?.records[0]?.type === 'signer_created') {
      const getCreateAccountDestination = url?._embedded?.records[0]?.account
      this.props.transaction['account'] = getCreateAccountDestination
    }
    if (url?._embedded?.records[0]?.type === 'account_credited') {
      const getInflationDestinationAccount = url?._embedded?.records[0]?.account
      this.props.transaction['account'] = getInflationDestinationAccount
    }
    this.setState({ dataKauKag: this.props.transaction })
    return transactionArray
  }
  async addOperationsToTransaction(transactionArray) {
    let Array = ''

    // console.log(operation.slice(0,121), 'tran')
    const getMemoOperationUrl = this.props.transaction?._links.operations?.href
    Array = getMemoOperationUrl
    const getResponseUrl = Array.slice(0, 124)
    const response = await fetch(`${getResponseUrl}?order=desc`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
    const url = await response.json()
    const getSigner = url?._embedded?.records[1]?.type
    this.props.transaction['type'] = getSigner
    if (url?._embedded?.records[1]?.type === 'set_options') {
      const getSignerKey = url?._embedded?.records[1]?.signer_key
      this.props.transaction['signer_key'] = getSignerKey
    } else if (url?._embedded?.records[0]?.type === 'set_options') {
      // const getSigner = url?._embedded?.records[0]?.type
      // this.props.transaction['type'] = getSigner
      const getSignerValue = url?._embedded?.records[0]?.signer_key
      this.props.transaction['signer_key'] = getSignerValue
    }
  }
  componentDidMount() {
    this.handleOperations(this.props.transaction)
    this.addOperationsToTransactionArray(this.props.transaction)
    this.addOperationsToTransaction(this.props.transaction)
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
    const networkType = this.state.operations?.records[0]?._links?.self?.href.slice(12, 19) === 'testnet' ? 'T' : ''
    currConn = networkType + this.state.operations?.records[0]?._links?.self?.href.slice(8, 11).toUpperCase()
    // const Amount = this.addOperationsToTransactionArray(transaction)
    // const SignerKey = this.addOperationsToTransaction(transaction)
    const data = `${renderAmount(this.props.transaction['amount'])}`
    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical is-parent'>
          <div className='tile is-child box'>
            <p className='subtitle'>Summary</p>

            <HorizontalLabelledField
              label='Created At'
              value={
                transaction.created_at.slice(8, 10) +
                '/' +
                transaction.created_at.slice(5, 7) +
                '/' +
                transaction.created_at.slice(0, 4) +
                ' ' +
                transaction.created_at.slice(11, 14) +
                transaction.created_at.slice(14, 17) +
                transaction.created_at.slice(17, 19) +
                ' ' +
                'UTC'
              }
            />
            <HorizontalLabelledField label='Amount' value={data} appendCurr={currConn} />
            <HorizontalLabelledField
              label='Fee'
              value={renderAmount(convertStroopsToKinesis(feePaid), precision)}
              appendCurr={currConn}
            />
            <HorizontalLabelledField label='Memo' value={transaction.memo} />
            <OperationListTransaction
              operations={this.state.operations}
              conn={conn}
              selectedConnection={this.props.selectedConnection}
            />
            <HorizontalLabelledField
              label='To'
              value={
                <Link to={`/account/${this.props.transaction['account']}`}>{this.props.transaction['account']}</Link>}
            />
            <HorizontalLabelledField
              label={
                this.props.transaction['type'] === 'set_options'
                  ? 'Signer Key'
                  : this.props.transaction['signer_key']
                  ? 'Signer Key'
                  : ''
              }
              value={this.props.transaction['signer_key']}
            />
          </div>
        </div>
      </div>
    )
  }
}

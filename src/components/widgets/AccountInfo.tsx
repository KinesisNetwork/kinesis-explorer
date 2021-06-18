import { AccountRecord, CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { startCase } from 'lodash'
import { isEmpty } from 'lodash'
import * as React from 'react'
import { getTransactions, getTransactionStream } from '../../services/kinesis'
import { Connection } from '../../types'
import { renderAmount } from '../../utils'
import DownArrow from '../css/images/down-arrow.svg'
import { HorizontalLabelledField, HorizontalLabelledFieldBalance, HorizontalLabelledFieldInfo } from '../shared'
import { OperationList } from './OperationList'

interface KemRecord extends AccountRecord {
  signers: Array<
    {
      public_key: string
      weight: number
      key?: string,
    }
  >
}

interface Props {
  accountId: string,
  account: KemRecord,
  selectedConnection: Connection,
}

interface State {
  operations: CollectionPage<OperationRecord> | null
  lastPagingToken: string | undefined
  showLoadMore: boolean
  isSignersOpen: boolean
}

export class AccountInfo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      operations: null,
      lastPagingToken: undefined,
      showLoadMore: true,
      isSignersOpen: false,
    }

    this.onClickLoadMore = this.onClickLoadMore.bind(this)
  }

  loadOperations = async (cursor?: string, limit: number = 10) => {
    const operations = await this.props.account.operations({ limit, cursor, order: 'desc' })

    const lastPagingToken = operations.records.length
      ? operations.records[operations.records.length - 1].paging_token
      : undefined

    const showLoadMore = operations.records.length ? operations.records.length === limit : !cursor
    const originalRecordSet = this.state.operations ? this.state.operations.records : []
    // Simple de-duping
    operations.records = originalRecordSet.concat(
      ...operations.records.filter((v) => {
        return originalRecordSet.findIndex((ov) => ov.id === v.id) === -1
      }),
    )

    this.setState({
      operations,
      lastPagingToken,
      showLoadMore,
    })
  }

  loadMergedTransactions = async (cursor: string = 'now', limit: number = 10) => {
    const transactions = await getTransactions(this.props.selectedConnection, this.props.accountId, limit, cursor)

    const lastPagingToken = transactions.length ? transactions[transactions.length - 1].paging_token : undefined

    const showLoadMore = transactions.length ? transactions.length === limit : !cursor
    const originalRecordSet = this.state.operations ? this.state.operations.records : []

    // Simple de-duping
    const records = await Promise.all(
      transactions.map((transaction) =>
        transaction.operations({
          limit: transaction.operation_count,
          cursor: undefined,
          order: 'desc',
        }),
      ),
    )
    const operations = {
      records: records.map((entry) => entry.records).reduce((total, amount) => total.concat(amount), []),
      next: () => Promise.resolve({ records: [], next: () => Promise.resolve(), prev: () => Promise.resolve() } as any),
      prev: () => Promise.resolve({ records: [], next: () => Promise.resolve(), prev: () => Promise.resolve() } as any),
    }

    // Simple de-duping
    operations.records = originalRecordSet.concat(
      ...operations.records.filter((v) => {
        return originalRecordSet.findIndex((ov) => ov.id === v.id) === -1
      }),
    )

    this.setState({
      operations,
      lastPagingToken,
      showLoadMore,
    })
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.account.account_id !== this.props.account.account_id) {
      this.loadOperations()
    }
  }

  componentDidMount() {
    this.setState({
      lastPagingToken: undefined,
    })

    if (this.props.account.balances[0].balance === '0.0') {
      this.loadMergedTransactions()
    } else {
      this.loadOperations()
    }
  }

  onClickLoadMore() {
    // 200 is the limit as defined on the horizon server
    if (this.props.account.balances[0].balance === '0.0') {
      this.loadMergedTransactions(this.state.lastPagingToken, 10)
    } else {
      this.loadOperations(this.state.lastPagingToken, 10)
    }
  }

  renderBalances = () => {
    const precision = this.props.selectedConnection.currency === 'KEM' ? 7 : 5
    const balances = this.props.account.balances
      .map((balance) =>
        balance.asset_type === 'native' ? { ...balance, asset_type: this.props.selectedConnection.currency } : balance,
      )
      .map((balance) => ({ ...balance, balance: renderAmount(balance.balance, precision) }))
      .map((balance, i) => (
        <HorizontalLabelledFieldBalance key={i} label={balance.asset_type} value={balance.balance} />
      ))

    return <React.Fragment>{balances}</React.Fragment>
  }

  renderThresholds = () => {
    const thresholds = Object.entries(this.props.account.thresholds).map(([key, value]) => (
      <HorizontalLabelledFieldInfo key={key} label={startCase(key)} value={value} wideLabel={true} />
    ))
    return <React.Fragment>{thresholds}</React.Fragment>
  }

  renderSigners = () => {
    const signers = this.props.account.signers.map((signer, i) => {

      return (
        <div key={i}>
          <HorizontalLabelledField
            label='Public Key'
            value={signer.public_key || signer.key}
            tag={`Weight: ${signer.weight}`}
          />
        </div>
      )
    })
    return <React.Fragment>{signers}</React.Fragment>
  }

  renderSignersKey = () => {
    this.setState({ isSignersOpen: !this.state.isSignersOpen })
  }

  connectionSelector(): string {
    if (this.props.selectedConnection.name === 'Kinesis KAU Mainnet') {
      return 'KAU'
    } else if (this.props.selectedConnection.name === 'Kinesis KAG Mainnet') {
      return 'KAG'
    } else if (this.props.selectedConnection.name === 'Kinesis KEM Mainnet') {
      return 'KEM'
    } else if (this.props.selectedConnection.name === 'Kinesis KAU Testnet') {
      return 'TKAU'
    } else if (this.props.selectedConnection.name === 'Kinesis KAG Testnet') {
      return 'TKAG'
    } else if (this.props.selectedConnection.name === 'Kinesis KEM Testnet') {
      return 'TKEM'
    } else { return 'KAU' }
  }

  render() {
    const { account } = this.props
    const { showLoadMore, operations } = this.state
    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical'>
          <div className='tile'>
            <div className='tile is-parent'>
              <div className='tile is-child box'>
                <p className='subtitle'>Balances</p>
                {this.renderBalances()}
              </div>
            </div>
            <div className='tile is-parent'>
              <div className='tile is-child box'>
                <p className='subtitle'>Info</p>
                {this.renderThresholds()}
                {/* //Expandable View */}
                <button className='drop-down-arrow' onClick={() => this.renderSignersKey()}>
                View Signers <img className='down-arrow' src={DownArrow} />
                </button>
              </div>
            </div>
          </div>
          {this.state.isSignersOpen ? (
            <div>
              <div className='tile is-parent'>
                <div className='tile is-child box'>
                  <p className='subtitle'>KAU Signers</p>
                  {this.renderSigners()}
                  <br/>
                  <p className='subtitle'>KAG Signers</p>
                  {this.renderSigners()}
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
          {/* <div className="tile is-parent">
            <div className="tile is-child box">
              <p className="subtitle">Signers</p>
              {this.renderSigners()}
            </div>
          </div> */}
          <div className='tile is-parent is-vertical'>
            <OperationList operations={operations} conn={this.connectionSelector()} />
            {showLoadMore && (
              <button className='button' onClick={this.onClickLoadMore}>
                Load more
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }
}

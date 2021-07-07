import { AccountRecord, CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import _, { startCase } from 'lodash'
import { isEmpty } from 'lodash'
import * as React from 'react'
import { getTransactions, getTransactionStream } from '../../services/kinesis'
import { Connection } from '../../types'
import { renderAmount } from '../../utils'
import DownArrow from '../css/images/down-arrow.svg'
import { HorizontalLabelledField, HorizontalLabelledFieldBalance, HorizontalLabelledFieldInfo } from '../shared'
import { OperationList } from './OperationList'

interface KemRecord extends AccountRecord {
  signers: Array<{
    public_key: string,
    weight: number,
    key?: string,
  }>
}

interface Props {
  accountId: string
  accountKau: KemRecord
  accountKag: KemRecord
  selectedConnection: Connection
}

interface State {
  operations: CollectionPage<OperationRecord> | any
  lastPagingToken: string | undefined
  showLoadMore: boolean
  isSignersOpen: boolean
}

export class AccountInfo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      operations: {},
      lastPagingToken: undefined,
      showLoadMore: true,
      isSignersOpen: false,
    }

    this.onClickLoadMore = this.onClickLoadMore.bind(this)
  }

  loadOperations = async (
    cursor?: string,
    limit: number = 10,
    account?: any,
    lastPagingToken?: any,
    showLoadMore?: any,
    operations?: any,
    keys?: any,
  ) => {
    operations = await account.operations({ limit, cursor, order: 'desc' })

    lastPagingToken = operations.records.length
      ? operations.records[operations.records.length - 1].paging_token
      : undefined

    showLoadMore = operations.records.length ? operations.records.length === limit : !cursor
    const originalRecordSet = this.state[operations] ? this.state[operations].records : []
    // Simple de-duping
    operations.records = originalRecordSet.concat(
      ...operations.records.filter((v) => {
        return originalRecordSet.findIndex((ov) => ov.id === v.id) === -1
      }),
    )
    return [operations, lastPagingToken, showLoadMore]
    // this.setState({
    //  [this.state[keys.operations]]:operations,
    //  [this.state[keys.lastPagingToken]]:lastPagingToken,
    //  [this.state[keys.showLoadMore]]:showLoadMore,
    // })
  }

  handleOperations = async (account?: any, cursor?: string, limit: number = 10) => {
    if (!account) {
      return
    }
    // let [operations, lastPagingToken, showLoadMore] = await this.loadOperations(
    const result = await this.loadOperations(
      cursor,
      limit,
      account,
      this.state.lastPagingToken,
      this.state.showLoadMore,
      this.state.operations,
    )
    const [lastPagingToken, showLoadMore] = result
    let [operations] = result

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
      lastPagingToken,
      showLoadMore,
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

  loadMergedTransactions = async (cursor: string = 'now', limit: number = 10) => {
    const transactions = await getTransactions(this.props.selectedConnection, this.props.accountId, limit, cursor)
    const lastPagingToken = transactions.length ? transactions[transactions.length - 1].paging_token : undefined
    const showLoadMore = transactions.length ? transactions.length === limit : !cursor
    const originalRecordSet = this.state.operations ? this.state.operations['records'] : []

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
    console.log(records, 'records.......')
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
    if (prevProps.accountKag?.account_id !== this.props.accountKag?.account_id) {
      this.handleOperations(this.props.accountKag)
    } else if (prevProps.accountKau?.account_id !== this.props.accountKau?.account_id) {
      this.handleOperations(this.props.accountKau)
    }
  }

  componentDidMount() {
    this.setState({
      lastPagingToken: undefined,
    })
    if (this.props.accountKag?.balances[0]?.balance === '0.0') {
      this.loadMergedTransactions()
      console.log(this.loadMergedTransactions(), 'ABC.....')
    } else {
      // this.loadOperations()
      this.handleOperations(this.props.accountKag)
    }
    if (this.props.accountKau?.balances[0]?.balance === '0.0') {
      this.loadMergedTransactions()
      console.log(this.loadMergedTransactions(), 'DEF.....')
    } else {
      // this.loadOperations()
      this.handleOperations(this.props.accountKau)
    }
  }

  onClickLoadMore() {
    // 200 is the limit as defined on the horizon server
    if (this.props.accountKag?.balances[0].balance === '0.0') {
      this.loadMergedTransactions(this.state.lastPagingToken, 10)
      console.log(this.loadMergedTransactions, 'GHI.....')
    } else {
      this.handleOperations(this.props.accountKag, '', 10)
    }
    if (this.props.accountKau?.balances[0].balance === '0.0') {
      this.loadMergedTransactions(this.state.lastPagingToken, 10)
      console.log(this.loadMergedTransactions, 'JKL.....')
    } else {
      this.handleOperations(this.props.accountKau, '', 10)
    }
  }

  renderBalances = () => {
    const currencyArray = this.props.selectedConnection?.currency
    let balances = []
    const balanceKau = this.getBalances(this.props.accountKau?.balances, 'KAU', 5)
    const balanceKag = this.getBalances(this.props.accountKag?.balances, 'KAG', 5)
    balances = [...balanceKau, ...balanceKag]
    balances = balances.map((balance, i) => (
      <HorizontalLabelledFieldBalance key={i} label={balance.asset_type} value={balance.balance} />
    ))
    return <React.Fragment>{balances}</React.Fragment>
  }

  getBalances = (balances, currency, precision) => {
    if (!balances || !balances.length) {
      return []
    }
    balances
      ?.map((balance) => {
        if (balance.asset_type === 'native') {
          balance['asset_type'] = currency
        }
        return balance
      })
      .map((balance) => ({ ...balance, balance: renderAmount(balance?.balance, precision) }))
    return balances
  }

  getThresholdData = (threshold, key) => {
    const thresholdData = {}

    for (const thresholds of Object.keys(threshold)) {
      thresholdData[key + '_' + thresholds] = threshold[thresholds]
    }
    return thresholdData
  }

  getAccountThresholds = () => {
    const thresholdKag = this.props.accountKag?.thresholds
    const thresholdKau = this.props.accountKau?.thresholds

    if (thresholdKau && thresholdKag) {
      return { ...this.getThresholdData(thresholdKau, 'KAU'), ...this.getThresholdData(thresholdKag, 'KAG') }
    } else if (thresholdKau) {
      return { ...this.getThresholdData(thresholdKau, 'KAU') }
    } else if (thresholdKag) {
      return { ...this.getThresholdData(thresholdKag, 'KAG') }
    }
  }

  renderThresholds = () => {
    const threshold = this.getAccountThresholds()
    const thresholds = Object.entries(threshold).map(([key, value]) => (
      <HorizontalLabelledFieldInfo key={key} label={startCase(key)} value={value} wideLabel={true} />
    ))
    return <React.Fragment>{thresholds}</React.Fragment>
  }

  renderSigners = (account) => {
    const signers = account?.map((signer, i) => {
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
    if (
      this.props.selectedConnection.kau.name.toLowerCase().includes('mainnet') &&
      this.props.selectedConnection.kau.currency.toLowerCase().includes('kau')
    ) {
      return 'KAU'
    } else if (
      this.props.selectedConnection.kag.name.toLowerCase().includes('mainnet') &&
      this.props.selectedConnection.kag.currency.toLowerCase().includes('kag')
    ) {
      return 'KAG'
    } else if (
      this.props.selectedConnection.kau.name.toLowerCase().includes('testnet') &&
      this.props.selectedConnection.kau.currency.toLowerCase().includes('kau')
    ) {
      return 'TKAU'
    } else if (
      this.props.selectedConnection.kag.name.toLowerCase().includes('testnet') &&
      this.props.selectedConnection.kag.currency.toLowerCase().includes('kag')
    ) {
      return 'TKAG'
    }
  }

  render() {
    const { accountKag } = this.props
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
                <button className='button w-100' onClick={() => this.renderSignersKey()}>
                  View Signers
                </button>
              </div>
            </div>
          </div>
          {this.state.isSignersOpen ? (
            <div>
              <div className='tile is-parent'>
                <div className='tile is-child box'>
                  <p className='subtitle'>KAU Signers</p>
                  {this.renderSigners(this.props.accountKau?.signers)}
                  <br />
                  <p className='subtitle'>KAG Signers</p>
                  {this.renderSigners(this.props.accountKag?.signers)}
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
            <OperationList
              operations={operations}
              conn={this.connectionSelector()}
              selectedConnection={this.props.selectedConnection}
            />
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

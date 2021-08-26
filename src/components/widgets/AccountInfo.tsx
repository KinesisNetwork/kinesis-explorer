import { AccountRecord, CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import _, { startCase } from 'lodash'
import { isEmpty } from 'lodash'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { getRecords, getTransactions, getTransactionStream } from '../../services/kinesis'
import { Connection } from '../../types'
import { renderAmount } from '../../utils'
import DownArrow from '../css/images/down-arrow.svg'
import { HorizontalLabelledField, HorizontalLabelledFieldBalance, HorizontalLabelledFieldInfo } from '../shared'
import { OperationList } from './OperationList'
let currConn: string
interface KemRecord extends AccountRecord {
  signers: Array<{
    public_key: string
    weight: number
    key?: string
  }>
}
interface Props {
  accountId: string
  accountKau: KemRecord
  accountKag: KemRecord
  selectedConnection: Connection
  conn: String
}
interface State {
  operations: CollectionPage<OperationRecord> | any
  lastPagingToken: string | undefined
  showLoadMore: boolean
  showLoadMore1: boolean
  isSignersOpen: boolean
  transLimitKau: number
  transLimitKag: number
  limitOpKau: number
  limitOpKag: number
  dataKau: any[]
  dataKag: any[]
  dataKauKag: any
  sortType: any
}
export class AccountInfo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      operations: {},
      lastPagingToken: undefined,
      showLoadMore: true,
      showLoadMore1: true,
      isSignersOpen: false,
      transLimitKau: 20,
      transLimitKag: 10,
      limitOpKau: 10,
      limitOpKag: 10,
      dataKau: [],
      dataKag: [],
      dataKauKag: [],
      sortType: 'desc',
    }
    this.moreTxs = this.moreTxs.bind(this)
  }
  componentDidUpdate() {
    this.fetchSearch()
  }
  // componentDidMount() {
  //   this.fetchSearch()
  // }
  renderBalances = () => {
    const currencyArray = this.props.selectedConnection?.currency
    let balances = []
    // const balanceKau = this.getBalances(this.props.accountKau?.balances, 'KAU', 5)
    // const balanceKag = this.getBalances(this.props.accountKag?.balances, 'KAG', 5)
    if (Number(localStorage.getItem('selectedConnection')) === 1) {
      const balanceKau = this.getBalances(this.props.accountKau?.balances, 'TKAU', 5)
      const balanceKag = this.getBalances(this.props.accountKag?.balances, 'TKAG', 5)
      balances = [...balanceKau, ...balanceKag]
      balances = balances.map((balance, i) => (
        <HorizontalLabelledFieldBalance key={i} label={balance.asset_type} value={balance.balance} />
      ))
      return <React.Fragment>{balances}</React.Fragment>
    } else {
      // console.log('Mainnet')
      const balanceKau = this.getBalances(this.props.accountKau?.balances, 'KAU', 5)
      const balanceKag = this.getBalances(this.props.accountKag?.balances, 'KAG', 5)
      balances = [...balanceKau, ...balanceKag]
      balances = balances.map((balance, i) => (
        <HorizontalLabelledFieldBalance key={i} label={balance.asset_type} value={balance.balance} />
      ))
      return <React.Fragment>{balances}</React.Fragment>
    }
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
    if (Number(localStorage.getItem('selectedConnection')) === 1) {
      if (thresholdKau && thresholdKag) {
        return { ...this.getThresholdData(thresholdKau, 'TKAU'), ...this.getThresholdData(thresholdKag, 'TKAG') }
      } else if (thresholdKau) {
        return { ...this.getThresholdData(thresholdKau, 'KAU') }
      } else if (thresholdKag) {
        return { ...this.getThresholdData(thresholdKag, 'KAG') }
      }
    } else {
      if (thresholdKau && thresholdKag) {
        return { ...this.getThresholdData(thresholdKau, 'KAU'), ...this.getThresholdData(thresholdKag, 'KAG') }
      } else if (thresholdKau) {
        return { ...this.getThresholdData(thresholdKau, 'KAU') }
      } else if (thresholdKag) {
        return { ...this.getThresholdData(thresholdKag, 'KAG') }
      }
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
            label="Public Key"
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
      return
    } else if (
      this.props.selectedConnection.kag.name.toLowerCase().includes('mainnet') &&
      this.props.selectedConnection.kag.currency.toLowerCase().includes('kag')
    ) {
      return
    } else if (
      this.props.selectedConnection.kau.name.toLowerCase().includes('testnet') &&
      this.props.selectedConnection.kau.currency.toLowerCase().includes('kau')
    ) {
      return
    } else if (
      this.props.selectedConnection.kag.name.toLowerCase().includes('testnet') &&
      this.props.selectedConnection.kag.currency.toLowerCase().includes('kag')
    ) {
      return
    }
  }

  fetchSearch = async () => {
    console.log(this.props, 'accountkau...')
    const valKau = this.props.selectedConnection.kau.horizonURL
    const accountKauId = this.props.accountKau?.account_id
    const accountKagId = this.props.accountKag?.account_id
    const searchUrl = `${valKau}/accounts/${accountKauId}/operations?limit=200&order=desc `
    const valKag = this.props.selectedConnection.kag.horizonURL
    const searchLink = `${valKag}/accounts/${accountKagId}/operations?limit=200&order=desc `
    let dataKau = [...this.state.dataKau]
    let dataKag = [...this.state.dataKag]
    await fetch(searchUrl)
      .then((response) => {
        return response.json()
      })

      .then((response) => {
        const data = response._embedded.records

        dataKau = data
      })

      .catch((error) => {
        if (error) {
          // console.log('error')
        }
      })
    await fetch(searchLink)
      .then((response) => {
        return response.json()
      })
      .then((response) => {
        const data = response._embedded.records

        dataKag = data
      })
      .catch((error) => {
        if (error) {
          // console.log('error')
        }
      })
    this.setState({ dataKau, dataKag })
  }
  moreTxs() {
    this.setState((old) => {
      return { transLimitKau: old.transLimitKau + 20 }
    })
  }
  refreshPage() {
    window.location.reload()
  }
  render() {
    // const fetch = this.fetchSearch()
    const datas = [...this.state.dataKau, ...this.state.dataKag]
    return (
      <div className="tile is-ancestor">
        <div className="tile is-vertical">
          <div className="tile">
            <div className="tile is-parent">
              <div className="tile is-child box">
                <p className="subtitle">Balances</p>
                {this.renderBalances()}
              </div>
            </div>
            <div className="tile is-parent">
              <div className="tile is-child box">
                <p className="subtitle">Info</p>
                {this.renderThresholds()}
                {/* //Expandable View */}
                <button className="button w-100" onClick={() => this.renderSignersKey()}>
                  View Signers
                </button>
              </div>
            </div>
          </div>
          {this.state.isSignersOpen ? (
            <div>
              <div className="tile is-parent">
                <div className="tile is-child box">
                  <p className="subtitle">KAU Signers</p>
                  {this.renderSigners(this.props.accountKau?.signers)}
                  <br />
                  <p className="subtitle">KAG Signers</p>
                  {this.renderSigners(this.props.accountKag?.signers)}
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
          <div className="tile is-parent is-vertical">
            {datas.slice(0, this.state.transLimitKau).map((record) => {
              const networkType = record._links.self.href.slice(11, 18) === 'testnet' ? 'T' : ''
              currConn = networkType + record._links.self.href.slice(7, 10).toUpperCase()
              const data = `${renderAmount(record.amount)}`
              const dataBalance = `${renderAmount(record.starting_balance)}`
              return (
                <div className="tile is-ancestor">
                  <div className="tile is-vertical is-parent">
                    <div className="tile is-child box">
                      <p className="subtitle">{startCase(record.type)}</p>

                      <HorizontalLabelledField
                        label="Source Account"
                        value={
                          record.from ? (
                            <Link to={`/account/${record.from}`}>{record.from}</Link>
                          ) : (
                            <Link to={`/account/${record.source_account}`}>{record.source_account}</Link>
                          )
                        }
                      />
                      <HorizontalLabelledField
                        label="Created At"
                        value={
                          record.created_at.slice(8, 10) +
                          '/' +
                          record.created_at.slice(5, 7) +
                          '/' +
                          record.created_at.slice(0, 4) +
                          ' ' +
                          record.created_at.slice(11, 14) +
                          record.created_at.slice(14, 17) +
                          record.created_at.slice(17, 19) +
                          ' ' +
                          'UTC'
                        }
                      />
                      <HorizontalLabelledField
                        label="Transaction Hash"
                        value={
                          <Link to={`/transaction/${currConn}/${record.transaction_hash}`}>
                            {record.transaction_hash}
                          </Link>
                        }
                      />
                      <HorizontalLabelledField
                        label={
                          record.type === 'payment'
                            ? 'Asset Type'
                            : record.type === 'account_merge'
                            ? 'Account'
                            : record.type === 'create_account'
                            ? 'Amount'
                            : record.signer_key
                            ? 'Signer Key'
                            : ''
                        }
                        value={
                          record.type === 'payment' ? (
                            record.asset_type
                          ) : record.type === 'account_merge' ? (
                            <Link to={`/account/${record.source_account}`}>{record.source_account} </Link>
                          ) : record.type === 'create_account' ? (
                            dataBalance + ' ' + currConn
                          ) : record.signer_key ? (
                            record.signer_key
                          ) : (
                            ''
                          )
                        }
                      />
                      <HorizontalLabelledField
                        label={
                          record.type === 'payment'
                            ? 'From'
                            : record.type === 'account_merge'
                            ? 'Into'
                            : record.type === 'create_account'
                            ? 'Funder'
                            : ''
                        }
                        value={
                          record.from ? (
                            <Link to={`/account/${record.from}`}>{record.from}</Link>
                          ) : record.into ? (
                            <Link to={`/account/${record.into}`}>{record.into}</Link>
                          ) : record.type === 'create_account' ? (
                            <Link to={`/account/${record.source_account}`}>{record.source_account}</Link>
                          ) : (
                            ''
                          )
                        }
                      />
                      <HorizontalLabelledField
                        label={record.type === 'payment' ? 'To' : record.type === 'create_account' ? 'To' : ''}
                        value={
                          record.to ? (
                            <Link to={`/account/${record.to}`}>{record.to}</Link>
                          ) : record.type === 'create_account' ? (
                            <Link to={`/account/${record.account}`}>{record.account}</Link>
                          ) : (
                            ''
                          )
                        }
                      />
                      <HorizontalLabelledField
                        label={record.type === 'payment' ? 'Amount' : ''}
                        value={record.amount ? data + ' ' + currConn : ''}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {this.state.transLimitKau < datas.length && (
              <button
                className="button"
                onClick={() => this.moreTxs()}
                style={{ width: '100%', marginTop: '3px', overflowAnchor: 'none' }}
              >
                Load More...
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }
}

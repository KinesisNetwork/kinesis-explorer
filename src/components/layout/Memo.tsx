import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import moment from 'moment'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { convertStroopsToKinesis } from '../../services/kinesis'
import { Connection } from '../../types'
import { renderAmount } from '../../utils'
import { HorizontalLabelledField } from '../shared'
import OperationValue from '../widgets/OperationValue'

let currConn: string
interface ConnectedTransactionProps extends RouteComponentProps<{ id: string; connection: string }> {}
interface Props extends ConnectedTransactionProps, ConnectionContext {}

interface State {
  transaction: TransactionRecord | null
  invalidTransaction: boolean
  conn: string | undefined
  selectedConnectionName: Connection | undefined
  operations: any[]
  data: any[]
  dataKau: any[]
  dataKag: any[]
  dataKauRecursive: any[]
  dataKagRecursive: any[]
  value: string
  transLimit: number
  dataAmount: any
  dataAmount1: any
  dataAmountKag: any
  dataKauKag: any
  dataKauDetailsRecursive: any
  dataKagDetailsRecursive: any
}

class MemoPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      transaction: null,
      invalidTransaction: false,
      conn: undefined,
      selectedConnectionName: undefined,
      data: [],
      dataKau: [],
      dataKag: [],
      dataKauRecursive: [],
      dataKagRecursive: [],
      operations: [],
      value: '',
      transLimit: 10,
      dataAmount: [],
      dataAmount1: [],
      dataAmountKag: [],
      dataKauKag: [],
      dataKauDetailsRecursive: [],
      dataKagDetailsRecursive: [],
    }
    this.moreTxs = this.moreTxs.bind(this)
  }

  fetchSearch = async (query) => {
    const valKau = this.props.selectedConnection.kau.horizonURL
    const searchUrl = `${valKau}/transactions?limit=100&order=desc&q=${query} `
    const valKag = this.props.selectedConnection.kag.horizonURL
    const searchLink = `${valKag}/transactions?limit=100&order=desc&q=${query} `
    let dataKau = [...this.state.dataKau]
    let dataKag = [...this.state.dataKag]

    await fetch(searchUrl)
      .then((response) => {
        return response.json()
      })

      .then((response) => {
        const data = response._embedded.records.filter((e) => {
          if (e.memo) {
            return e.memo.toLowerCase().includes(query.toLowerCase())
          }
        })
        dataKau = [...dataKau]
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
        const data = response._embedded.records.filter((e) => {
          if (e.memo) {
            return e.memo.toLowerCase().includes(query.toLowerCase())
          }
        })
        dataKag = [...dataKag]
      })

      .catch((error) => {
        if (error) {
          // console.log('error')
        }
      })
    await this.setState({ dataKau, dataKag })
    this.doRecursiveRequest(searchUrl)
    this.doRecursive(searchLink)
    this.addOperationsToTransactionArray([...this.state.dataKau, ...this.state.dataKag])
  }

  doRecursiveRequest = async (searchUrl) => {
    let dataKauRecursive = [...this.state.dataKauRecursive]
    return fetch(searchUrl).then(async (res) => {
      const currentResult = await res.json()
      if (
        currentResult &&
        currentResult._embedded &&
        currentResult._embedded.records &&
        currentResult._embedded.records.length
      ) {
        const query = this.createQuery()
        const data = currentResult._embedded.records.filter((e) => {
          if (e.memo) {
            return e.memo.toLowerCase().includes(query.toLowerCase())
          }
        })
        dataKauRecursive = [...data, ...dataKauRecursive]
        this.setState({ dataKauRecursive })
        this.addOperationsToKauRecursive([...this.state.dataKauRecursive])
        return this.doRecursiveRequest(currentResult._links.next.href)
      } else {
        return this.doRecursiveRequest(currentResult._links.next.href)
      }
    })
  }
  doRecursive = async (searchLink) => {
    let dataKagRecursive = [...this.state.dataKagRecursive]
    await fetch(searchLink).then(async (res) => {
      const Result = await res.json()
      if (Result && Result._embedded && Result._embedded.records && Result._embedded.records.length) {
        const query = this.createQuery()
        const data = Result._embedded.records.filter((e) => {
          if (e.memo) {
            return e.memo.toLowerCase().includes(query.toLowerCase())
          }
        })
        dataKagRecursive = [...data, ...dataKagRecursive]
        this.setState({ dataKagRecursive })
        this.addOperationsToKagRecursive([...this.state.dataKagRecursive])
        return this.doRecursive(Result._links.next.href)
      } else {
        return this.doRecursive(Result._links.next.href)
      }
    })
    this.setState({ dataKagRecursive })
  }
  async addOperationsToTransactionArray(transactionArray) {
    // console.log(transactionArray, 'transactionArray....')
    const dataMixed = await Promise.all(
      transactionArray.map((transactionRecord) => {
        const operationUrl = transactionRecord._links.operations.href.slice(0, 123)
        return fetch(operationUrl)
          .then((res) => res.json())
          .then((response) => ({ ...transactionRecord, operations: response._embedded.records[0] }))
      }),
    )
    // console.log(dataMixed, 'dataMixed...')
    this.setState({ dataKauKag: dataMixed })
  }
  async addOperationsToKauRecursive(transactionArray) {
    // console.log(transactionArray, 'transactionArray....')
    const dataMixedRecursive = await Promise.all(
      transactionArray.map((transactionRecord) => {
        const operationUrl = transactionRecord._links.operations.href.slice(0, 123)
        return fetch(operationUrl)
          .then((res) => res.json())
          .then((response) => ({ ...transactionRecord, operations: response._embedded.records[0] }))
      }),
    )
    // console.log(dataMixedRecursive, 'dataMixed...')
    this.setState({ dataKauDetailsRecursive: dataMixedRecursive })
  }
  async addOperationsToKagRecursive(transactionArray) {
    // console.log(transactionArray, 'transactionArray....')
    const dataMixedKagRecursive = await Promise.all(
      transactionArray.map((transactionRecord) => {
        const operationUrl = transactionRecord._links.operations.href.slice(0, 123)
        return fetch(operationUrl)
          .then((res) => res.json())
          .then((response) => ({ ...transactionRecord, operations: response._embedded.records[0] }))
      }),
    )
    // console.log(dataMixedKagRecursive, 'dataMixed...')
    this.setState({ dataKagDetailsRecursive: dataMixedKagRecursive })
  }
  componentDidMount() {
    const query = this.createQuery()
    this.fetchSearch(query)
  }
  createQuery = () => {
    const query = window.location.pathname.split('/')
    if (query[1] === 'memo') {
      return query[3].replaceAll('-', ' ').replace('_', '#')
    }
    return query[2]
  }

  moreTxs() {
    this.setState((old) => {
      return { transLimit: old.transLimit + 10 }
    })
  }
  render() {
    const query = this.createQuery()
    const datas = [...this.state.dataKauDetailsRecursive, ...this.state.dataKagDetailsRecursive]
    datas.sort((a, b) =>
      moment(a.created_at).valueOf() < moment(b.created_at).valueOf()
        ? 1
        : moment(b.created_at).valueOf() < moment(a.created_at).valueOf()
        ? -1
        : 0,
    )
    // console.log(this.state.dataKauKag, 'this.state.dataMixed....')

    return (
      <section className='section'>
        <div className='container'>
          <div className='tile is-vertical is-parent'>
            <article className='tile is-child'>
              <p className='title  is-child box' style={{ marginBottom: '1.0rem' }}>
                Showing results for <b>{query}</b>
              </p>
              <table className='table is-bordered is-striped is-fullwidth'>
                <thead className='thead'>
                  <tr className='tr'>
                    <th className='th'>Date & Time (UTC)</th>
                    <th className='th'>Hash</th>
                    <th className='th'>From</th>
                    <th className='th'>To</th>
                    <th className='th'>Amount</th>
                    <th className='th'>Fee</th>
                    <th className='th'>Memo</th>
                  </tr>
                </thead>

                {[
                  ...this.state.dataKauKag,
                  // ...this.state.dataKauDetailsRecursive,
                  // ...this.state.dataKagDetailsRecursive,
                  ...datas,
                ]
                  .slice(0, this.state.transLimit)
                  .map((record) => {
                    const networkType = record._links.self.href.slice(11, 18) === 'testnet' ? 'T' : ''
                    currConn = networkType + record._links.self.href.slice(7, 10).toUpperCase()
                    const feePaid = record.fee_paid || Number(record.fee_charged)
                    const operationBalance =
                      record.operations?.starting_balance && parseFloat(record.operations?.starting_balance).toFixed(5)
                    const operationAmount =
                      record.operations?.amount && parseFloat(record.operations?.amount).toFixed(5)
                    const precision = currConn === 'KEM' ? 7 : 5
                    this.state.dataKauKag.sort((a, b) =>
                      moment(a.created_at).valueOf() < moment(b.created_at).valueOf()
                        ? 1
                        : moment(b.created_at).valueOf() < moment(a.created_at).valueOf()
                        ? -1
                        : 0,
                    )
                    return (
                      <tbody key={record.id} className='tbody'>
                        <tr key={record.id} className='tr'>
                          <td className='td'>
                            {record.created_at.slice(8, 10)}/{record.created_at.slice(5, 7)}/
                            {record.created_at.slice(0, 4)}&nbsp;
                            {record.created_at.slice(11, 14)}
                            {record.created_at.slice(14, 17)}
                            {record.created_at.slice(17, 19)}
                          </td>
                          <td className='td'>
                            <Link to={`/transaction/${currConn}/${record.hash}`}>
                              {record.hash.slice(0, 4)}.....{record.hash.substr(record.hash.length - 4)}
                            </Link>
                          </td>
                          <td className='td'>
                            <Link to={`/account/${record.source_account}`}>
                              {record.source_account.slice(0, 4)}.....
                              {record.source_account.substr(record.source_account.length - 4)}
                            </Link>
                          </td>
                          <td className='td'>
                            {record.operations?.to ? (
                              <Link to={`/account/${record.operations?.to}`}>
                                {' '}
                                {record.operations?.to.slice(0, 4) +
                                  '.....' +
                                  record.operations?.to.substr(record.operations?.to.length - 4)}{' '}
                              </Link>
                            ) : (
                              <Link to={`/account/${record.operations?.account}`}>
                                {record.operations?.account.slice(0, 4) +
                                  '.....' +
                                  record.operations?.account.substr(record.operations?.account.length - 4)}
                              </Link>
                            )}
                          </td>
                          <td>
                            {record.operations?.starting_balance ? operationBalance : operationAmount}
                            &nbsp; {currConn}
                          </td>
                          <td className='td'>
                            {renderAmount(convertStroopsToKinesis(feePaid), precision)} {currConn}
                          </td>
                          <td className='td'>{record.memo}</td>
                        </tr>
                      </tbody>
                    )
                  })}
              </table>
              <button
                className='button'
                onClick={() => this.moreTxs()}
                style={{ width: '100%', marginTop: '3px', overflowAnchor: 'none' }}
              >
                Load More...
              </button>
            </article>
          </div>
        </div>
      </section>
    )
  }
}

class ConnectedTransaction extends React.Component<ConnectedTransactionProps> {
  render() {
    return (
      <Subscribe to={[ConnectionContainer]}>
        {({ state }: ConnectionContainer) => <MemoPage {...this.props} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedTransaction

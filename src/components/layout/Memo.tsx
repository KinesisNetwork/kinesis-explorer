import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { Connection } from '../../types'
import { HorizontalLabelledField } from '../shared'

let currConn: string
interface ConnectedTransactionProps extends RouteComponentProps<{ id: string; connection: string }> {}
interface Props extends ConnectedTransactionProps, ConnectionContext {}

interface State {
  transaction: TransactionRecord | null
  invalidTransaction: boolean
  conn: string | undefined
  selectedConnectionName: Connection | undefined
  operations: CollectionPage<OperationRecord> | null
  data: any[]
  dataKau: any[]
  dataKag: any[]
  value: string
  // query : string
  transLimit: number
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
      operations: null,
      value: '',
      //  query: ''
      transLimit: 10,
    }
    this.moreTxs = this.moreTxs.bind(this)
  }

  fetchSearch = async (query) => {
    // console.log(query, 'Qu...........')
    const valKau = this.props.selectedConnection.kau.horizonURL
    const searchUrl = `${valKau}/transactions?limit=100&order=desc&q=${query} `
    const valKag = this.props.selectedConnection.kag.horizonURL
    const searchLink = `${valKag}/transactions?limit=100&order=desc&q=${query} `

    let dataKau = [...this.state.dataKau]
    let dataKag = [...this.state.dataKag]

    await fetch(searchUrl)
      // .then(async function(response) {
      //   return await response.json()
      // })
      .then((response) => {
        return response.json()
      })

      .then((response) => {
        const data = response._embedded.records.filter((e) => {
          if (e.memo) {
            // console.log(e.memo, 'MEMO.......', query.toLowerCase())
            return e.memo.toLowerCase().includes(query.toLowerCase())
          }
          // console.log('Data Kau.............', dataKau, query, response)
        })
        dataKau = [...data]
        // console.log(dataKau, query.toLowerCase(), data.memo, 'datakau.........')
      })

      .catch((error) => {
        if (error) {
          // console.log(dataKau, query.toLowerCase(), data.memo, 'datakau.........')
        }
      })
    await fetch(searchLink)
    .then((response) => {
      return response.json()
    })
      .then((response) => {
        const data = response._embedded.records.filter((e) => {
          if (e.memo) {
            // console.log(e.memo, 'MEMO.......', query.toLowerCase())
            return e.memo.toLowerCase().includes(query.toLowerCase())
          }
          // console.log('Data Kag.............', dataKag)
        })
        dataKag = [...data]
      })
      .catch((error) => {
        if (error) {
          // console.log('Data Kag.............', dataKag)
        }
      })
    // console.log(dataKau, dataKag, 'THIS IS DATA.........')
    this.setState({ dataKau, dataKag })

    this.doRecursiveRequest(searchUrl)
    this.doRecursive(searchLink)
  }

  doRecursiveRequest = async (searchUrl) => {
    let dataKau = [...this.state.dataKau]
    return fetch(searchUrl).then(async (res) => {
      const currentResult = await res.json()
      // console.log(currentResult, 'currentResult.......')
      if (
        currentResult &&
        currentResult._embedded &&
        currentResult._embedded.records &&
        currentResult._embedded.records.length
      ) {
        // console.log('true..........')
        const query = this.createQuery()
        const data = currentResult._embedded.records.filter((e) => {
          // console.log(currentResult._embedded.records.next, 'e.....')
          if (e.memo) {
            // console.log(e.memo, 'MEMO.......', query.toLowerCase())

            return e.memo.toLowerCase().includes(query.toLowerCase())
          }
          //  console.log('Data Kau.............', dataKau)
          // console.log('false..........')
        })
        dataKau = [...data, ...dataKau]
        this.setState({ dataKau })
        // console.log('Kau............', dataKau)
        // console.log('data.....', data)
        return this.doRecursiveRequest(currentResult._links.next.href)
      } else {
        return this.doRecursiveRequest(currentResult._links.next.href)
      }
    })
  }
  doRecursive = async (searchLink) => {
    let dataKag = [...this.state.dataKag]
    await fetch(searchLink).then(async (res) => {
      const Result = await res.json()
      if (Result && Result._embedded && Result._embedded.records && Result._embedded.records.length) {
        const query = this.createQuery()
        const data = Result._embedded.records.filter((e) => {
          if (e.memo) {
            // console.log(e.memo, 'MEMO.......', query.toLowerCase())
            return e.memo.toLowerCase().includes(query.toLowerCase())
          }
          // console.log('Data Kag.............', dataKag)

          // if (e.memo) {
          //   return e.memo.toLowerCase().includes(this.state.query.toLowerCase())
          // }
        })
        dataKag = [...data, ...dataKag]
        this.setState({ dataKag })
        // console.log('Kag............', dataKag)
        return this.doRecursive(Result._links.next.href)
      } else {
        return this.doRecursive(Result._links.next.href)
      }
    })
    // console.log(dataKag, 'datakag......')
    this.setState({ dataKag })
  }

  componentDidMount() {
    // const {query} = this.state

    const query = this.createQuery()
    this.fetchSearch(query)
    // console.log(query, 'qu.......')
    // console.log(query[3],query, 'Query......')
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
    // console.log(this.state.data, 'transaction..........')

    const networkType = this.state.dataKau[0]?._links?.self?.href.slice(11, 18) === 'testnet' ? 'T' : ''
    currConn = networkType + this.state.dataKau[0]?._links?.self?.href.slice(7, 10).toUpperCase()
    // console.log(currConn, 'DATAKAU')
    return (
      <section className='section'>
        <div className='container'>
          <div className='tile is-vertical is-parent'>
            <article className='tile is-child'>
              <p className='title  is-child box' style={{ marginBottom: '0.3rem' }}>
                Transactions
              </p>
              {[...this.state.dataKau, ...this.state.dataKag].slice(0, this.state.transLimit).map((record) => {
                return (
                  <div className='tile is-child box' key={record}>
                    <p className='subtitle'>Summary</p>
                    {/* <div onChange={this.handleChange}> */}
                    <HorizontalLabelledField
                      label='Created At'
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
                    <Link to={`/search/${this.state.value}`} />
                    <HorizontalLabelledField
                      label='Fee'
                      value={record.fee_paid}
                      appendCurr={record._links.self.href.slice(7, 10).toUpperCase()}
                    />{' '}
                    {/* {console.log(record.fee_paid, 'record...')} */}
                    <HorizontalLabelledField
                      label='Ledger'
                      value={<Link to={`/ledger/${record.ledger}`}>{record.ledger}</Link>}
                    />
                    <HorizontalLabelledField label='Operation Count' value={record.operation_count} />
                    <HorizontalLabelledField label='Memo' value={record.memo} />
                    <HorizontalLabelledField
                      label='Source Account'
                      value={<Link to={`/account/${record.source_account}`}>{record.source_account}</Link>}
                    />
                  </div>
                  // </div>
                )
              })}

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

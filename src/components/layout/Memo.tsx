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
        dataKau = [...data, ...dataKau]
      })

      .catch((error) => {
        if (error) {
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
        dataKag = [...data, ...dataKag]
      })
      .catch((error) => {
        if (error) {
        }
      })
    this.setState({ dataKau, dataKag })
    this.doRecursiveRequest(searchUrl)
    this.doRecursive(searchLink)
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
        return this.doRecursive(Result._links.next.href)
      } else {
        return this.doRecursive(Result._links.next.href)
      }
    })
    this.setState({ dataKagRecursive })
  }

  getFetchDestinationAccount = async (getMergedDatas) => {
    const getMergedData = [
    //  ...this.state.dataKau,
    //  ...this.state.dataKag,
      ...this.state.dataKauRecursive,
      ...this.state.dataKagRecursive,
    ]
    let dataArray = []
     for (let index = 0; index < getMergedData.length; index++) {
       const data = getMergedData[index]
       const getMemoOperationUrl = data?._links.operations?.href
      const getResponseUrl = getMemoOperationUrl.slice(0, 123)
      const response = await fetch(`${getResponseUrl}?order=desc`)
      const url = await response.json()
      const embeddedRecord = url?._embedded.records[index]
      const destinationAccount = {...data, ...embeddedRecord}
       dataArray.push(destinationAccount)
       this.setState({dataAmount:dataArray})
      return dataArray
     }
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
let to = [] 
    const data = this.getFetchDestinationAccount(this.state.operations)
    console.log(this.state.dataAmount, 'this.state.dataAmount....')
    console.log(this.state.dataKau, 'this.state.dataAmount....')

    return (
      <section className="section">
        <div className="container">
          <div className="tile is-vertical is-parent">
            <article className="tile is-child">
              <p className="title  is-child box" style={{ marginBottom: '1.0rem' }}>
               Showing results for <b>{query}</b>
              </p>
              {[
                ...this.state.dataKau,
                ...this.state.dataKag,
                ...this.state.dataKauRecursive,
                ...this.state.dataKagRecursive,
                
              ]
                .slice(0, this.state.transLimit)
                .map((record) => {
                  const networkType = record._links.self.href.slice(11, 18) === 'testnet' ? 'T' : ''
                  currConn = networkType + record._links.self.href.slice(7, 10).toUpperCase()
                  const feePaid = record.fee_paid || Number(record.fee_charged)
                  const precision = currConn === 'KEM' ? 7 : 5
                  return (
                    // <div className='box memo-card-margin' key={record}>
                    //   <p className='subtitle'>Summary</p>
                    //   <HorizontalLabelledField
                    //     label='Created At'
                    //     value={
                    //       record.created_at.slice(8, 10) +
                    //       '/' +
                    //       record.created_at.slice(5, 7) +
                    //       '/' +
                    //       record.created_at.slice(0, 4) +
                    //       ' ' +
                    //       record.created_at.slice(11, 14) +
                    //       record.created_at.slice(14, 17) +
                    //       record.created_at.slice(17, 19) +
                    //       ' ' +
                    //       'UTC'
                    //     }
                    //   />
                    //   <Link to={`/search/${this.state.value}`} />
                    //   <HorizontalLabelledField
                    //     label='Fee'
                    //     value={renderAmount(convertStroopsToKinesis(feePaid), precision)}
                    //     appendCurr={currConn}
                    //   />{' '}
                    //   <HorizontalLabelledField
                    //     label='Ledger'
                    //     value={<Link to={`/ledger/${record.ledger}`}>{record.ledger}</Link>}
                    //   />
                    //   <HorizontalLabelledField label='Operation Count' value={record.operation_count} />
                    //   <HorizontalLabelledField label='Memo' value={record.memo} />
                    //   <HorizontalLabelledField
                    //     label='Source Account'
                    //     value={<Link to={`/account/${record.source_account}`}>{record.source_account}</Link>}
                    //   />
                    // </div>
                    <table className="table is-bordered is-striped is-fullwidth">
                      <thead className="thead">
                        <tr className="tr">
                          <th className="th">Date & Time (UTC)</th>
                          <th className="th">Hash</th>
                          <th className="th">From</th>
                          <th className="th">To</th>
                          <th className="th">Amount</th>
                          <th className="th">Fee</th>
                          <th className="th">Memo</th>
                        </tr>
                      </thead>
                      <tbody className="tbody">
                        <tr key={record.id} className="tr">
                          <td className="td">
                            
                            {record.created_at.slice(8, 10)}/{record.created_at.slice(5, 7)}/
                            {record.created_at.slice(0, 4)}&nbsp;
                            {record.created_at.slice(11, 14)}
                            {record.created_at.slice(14, 17)}
                            {record.created_at.slice(17, 19)}
                          </td>
                          <td className="td">
                          <Link to={`/transaction/${currConn}/${record.hash}`}>
                            {record.hash.slice(0, 4)}.....{record.hash.substr(record.hash.length - 4)}
                            </Link>
                          </td>
                          <td className="td">
                            {record.source_account.slice(0, 4)}.....
                            {record.source_account.substr(record.source_account.length - 4)}
                          </td>
                          <td className="td">
                             {this.state.dataAmount.map((record, Key) => {
                              if(record.account){
                                let existing =  to.findIndex(item => item === record.account)
                                console.log(existing, 'Existing.....')
                                let account = ''
                                if(existing === -1) {
                                  to.push(record.account)
                                  account = record.account
                                }
                                // else {
                                //   account= to[existing]
                                // }
                              return (
                                  <div> {account.slice(0,4)}.....
                                  {account.substr(account.length - 4)}</div>
                              )
                              }
                              else if(record.to){
                                let existing =  to.findIndex(item => item === record.to)
                                console.log(existing, 'Existing.....')
                                let account = ''
                                if(existing === -1) {
                                  to.push(record.to)
                                  account = record.to
                                }
                              //   // else {
                              //   //   account= to[existing]
                              //   // }
                                
                                return (   
                                    <div>{account.slice(0,4)}.....
                                    {account.substr(account.length - 4)}</div>                                  
                                )
                                }
                              //   else if(record.into){
                              //     let existing =  to.findIndex(item => item === record.into)
                              //     console.log(existing, 'Existing.....')
                              //     let account = ''
                              //     if(existing === -1) {
                              //       to.push(record.into)
                              //       account = record.into
                              //     }
                              //     // else {
                              //     //   account= to[existing]
                              //     // }
                                  
                              //     return (   
                              //         <div>{account.slice(0,4)}.....
                              //         {account.substr(account.length - 4)}</div>                                  
                              //     )
                              //     }
                            })} 
                            {}
                          </td>
                          <td></td>
                          {/* <td className="td">{record.account}</td> */}
                          <td className="td">
                            {renderAmount(convertStroopsToKinesis(feePaid), precision)} {currConn}
                          </td>
                          <td className="td">{record.memo}</td>
                        </tr>
                      </tbody>
                    </table>
                  )
                })}

              <button
                className="button"
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

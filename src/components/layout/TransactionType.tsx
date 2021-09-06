// import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
// import { startCase } from 'lodash'
// import moment from 'moment'
// import * as React from 'react'
// import { RouteComponentProps } from 'react-router'
// import { Link } from 'react-router-dom'
// import { Subscribe } from 'unstated'
// import { ConnectionContainer, ConnectionContext } from '../../services/connections'
// import { convertStroopsToKinesis } from '../../services/kinesis'
// import { Connection } from '../../types'
// import { renderAmount } from '../../utils'
// import Logo from '../css/images/copy.svg'
// import { HorizontalLabelledField } from '../shared'
// import OperationValue from '../widgets/OperationValue'
// let currConn: string
// interface ConnectedTransactionProps extends RouteComponentProps<{ id: string; connection: string }> { }
// interface Props extends ConnectedTransactionProps, ConnectionContext { }

// interface State {
//   transaction: TransactionRecord | null
//   invalidTransaction: boolean
//   conn: string | undefined
//   selectedConnectionName: Connection | undefined
//   operations: any[]
//   data: any[]
//   dataKau: any[]
//   dataKag: any[]
//   dataKauRecursive: any[]
//   dataKagRecursive: any[]
//   value: string
//   transLimit: number
//   dataAmount: any
//   dataAmount1: any
//   dataAmountKag: any
//   dataKauKag: any
//   dataKauDetailsRecursive: any
//   dataKagDetailsRecursive: any
//   dataKauInflationRecursive: any
//   dataKagInflationRecursive: any
//   sortType: any
// }

// class TransactionTypePage extends React.Component<Props, State> {
//   constructor(props: Props) {
//     super(props)
//     this.state = {
//       transaction: null,
//       invalidTransaction: false,
//       conn: undefined,
//       selectedConnectionName: undefined,
//       data: [],
//       dataKau: [],
//       dataKag: [],
//       dataKauRecursive: [],
//       dataKagRecursive: [],
//       operations: [],
//       value: '',
//       transLimit: 10,
//       dataAmount: [],
//       dataAmount1: [],
//       dataAmountKag: [],
//       dataKauKag: [],
//       dataKauDetailsRecursive: [],
//       dataKagDetailsRecursive: [],
//       dataKauInflationRecursive: [],
//       dataKagInflationRecursive: [],
//       sortType: 'desc',
//     }
//     this.moreTxs = this.moreTxs.bind(this)
//     //  this.imageClick = this.imageClick.bind(this)
//   }

//   fetchSearch = async (query) => {
//     const valKau = this.props.selectedConnection.kau.horizonURL
//     const searchUrl = `${valKau}/operations?limit=100&order=desc&q=${query} `
//     const valKag = this.props.selectedConnection.kag.horizonURL
//     const searchLink = `${valKag}/operations?limit=100&order=desc&q=${query} `
//     let dataKau = [...this.state.dataKau]
//     let dataKag = [...this.state.dataKag]

//     // console.log(searchUrl, 'search....')
//     await fetch(searchUrl)
//       .then((response) => {
//         return response.json()
//       })

//       .then((response) => {
//         const data = response._embedded.records.filter((e) => {
//           if (e.type) {
//             return e.type.toLowerCase().includes(query.toLowerCase())
//           }
//         })
//         dataKau = [data, ...dataKau]
//         // console.log(dataKau, 'datakau...')
//       })

//       .catch((error) => {
//         if (error) {
//           // console.log('error')
//         }
//       })
//     await fetch(searchLink)
//       .then((response) => {
//         return response.json()
//       })
//       .then((response) => {
//         const data = response._embedded.records.filter((e) => {
//           if (e.type) {
//             return e.type.toLowerCase().includes(query.toLowerCase())
//           }
//         })
//         dataKag = [data, ...dataKag]
//         // console.log(dataKag, 'datakag....')
//       })

//       .catch((error) => {
//         if (error) {
//           // console.log('error')
//         }
//       })
//     await this.setState({ dataKau, dataKag })
//     this.doRecursiveRequest(searchUrl)
//     this.doRecursive(searchLink)
//     // this.addOperationsToTransactionArray([...this.state.dataKau, ...this.state.dataKag])
//   }
//   doRecursiveRequest = async (searchUrl) => {
//     let dataKauRecursive = [...this.state.dataKauRecursive]
//     return fetch(searchUrl).then(async (res) => {
//       const currentResult = await res.json()
//       if (
//         currentResult &&
//         currentResult._embedded &&
//         currentResult._embedded.records &&
//         currentResult._embedded.records.length
//       ) {
//         const query = this.createQuery()
//         const data = currentResult._embedded.records.filter((e) => {
//           if (e.type) {
//             return e.type.toLowerCase().includes(query.toLowerCase().replaceAll(' ', '_'))
//           }
//         })
//         dataKauRecursive = [...data, ...dataKauRecursive]
//         // console.log(dataKauRecursive, 'datakaurecurs....')
//         this.setState({ dataKauRecursive })
//         this.addOperationsToKauRecursive([...this.state.dataKauRecursive])
//         return this.doRecursiveRequest(currentResult._links.next.href)
//       } else {
//         return this.doRecursiveRequest(currentResult._links.next.href)
//       }
//     })
//   }
//   doRecursive = async (searchLink) => {
//     let dataKagRecursive = [...this.state.dataKagRecursive]
//     await fetch(searchLink).then(async (res) => {
//       const Result = await res.json()
//       if (Result && Result._embedded && Result._embedded.records && Result._embedded.records.length) {
//         const query = this.createQuery()
//         const data = Result._embedded.records.filter((e) => {
//           if (e.type) {
//             return e.type.toLowerCase().includes(query.toLowerCase().replaceAll(' ', '_'))
//           }
//         })
//         dataKagRecursive = [...data, ...dataKagRecursive]
//         // console.log(dataKagRecursive, 'datakagrecurs....')
//         this.setState({ dataKagRecursive })
//         this.addOperationsToKagRecursive([...this.state.dataKagRecursive])
//         return this.doRecursive(Result._links.next.href)
//       } else {
//         return this.doRecursive(Result._links.next.href)
//       }
//     })
//     this.setState({ dataKagRecursive })

//   }
//   // async addOperationsToTransactionArray(transactionArray) {
//   //   console.log(transactionArray, 'transactionArray....')
//   //   const dataMixed = await Promise.all(
//   //     transactionArray.map((transactionRecord) => {

//   //        const operationUrl = transactionRecord._links?.transaction.href
//   //       // console.log('try.....')
//   //       return fetch(operationUrl)
//   //         .then((res) => res.json())
//   //         .then((response) => ({ ...transactionRecord, operations: response }))



//   //     }),
//   //   )
//   //   // console.log(dataMixed, 'dataMixed...')
//   //   this.setState({ dataKauKag: dataMixed })
//   // }
//   async addOperationsToKauRecursive(transactionArray) {
//     const dataMixedRecursive = await Promise.all(
//       transactionArray.map((transactionRecord) => {
//         const operationUrl = transactionRecord._links.transaction.href
//         return fetch(operationUrl)
//           .then((res) => res.json())
//           .then((response) => ({ ...transactionRecord, operations: response }))
//       })
//     )
//     this.setState({ dataKauDetailsRecursive: dataMixedRecursive })

//   }

//   async addOperationsToKagRecursive(transactionArray) {
//     const dataMixedKagRecursive = await Promise.all(
//       transactionArray.map((transactionRecord) => {
//         const operationUrl = transactionRecord._links.transaction.href
//         return fetch(operationUrl)
//           .then((res) => res.json())
//           .then((response) => ({ ...transactionRecord, operations: response }))
//       }),
//     )

//     this.setState({ dataKagDetailsRecursive: dataMixedKagRecursive })

//   }
//   //   async addEffectsToKauRecursive(transactionArray) {
//   //     //  console.log(transactionArray, 'transactionArray....')
//   //     const dataMixedRecursive = await Promise.all(
//   //       transactionArray.map((transactionRecord) => {
//   // //         const operationUrl = transactionRecord._links.transaction.href
//   //         const effectsUrl = transactionRecord._links.effects.href
//   //         // console.log(effectsUrl, 'effects..')
//   //     // console.log(operationUrl, 'url...')
//   //    return fetch(effectsUrl)
//   //            .then((res) => res.json())   
//   //         .then((response) => ({ ...transactionRecord, effects: response._embedded.records[0] }))

//   //       })

//   //    )
//   // //  console.log(dataMixedRecursive, 'dataMixed...')
//   //    this.setState({ dataKauInflationRecursive: dataMixedRecursive })
//   //   }
//   componentDidMount() {
//     const query = this.createQuery()
//     this.fetchSearch(query)
//   }
//   createQuery = () => {
//     const query = window.location.pathname.split('/')
//     console.log(query[3].replaceAll('_', ' '), 'query..')
//     if (query[1] === 'transactiontype') {

//       return query[3]
//     }
//     return query[2]
//   }
//   moreTxs() {
//     this.setState((old) => {
//       return { transLimit: old.transLimit + 10 }
//     })

//     // onSort = sortType => {

//     //   this.setState({sortType})
//     // }
//     // sortByField(field) {
//     //   if (field == 'created_at') {
//     //     const datas = [...this.state.dataKauDetailsRecursive, ...this.state.dataKagDetailsRecursive]
//     //     datas.sort((a,b) => (Number(a.created_at) > Number(b.created_at)) ? 1
//     // : ((Number(b.created_at) > Number(a.created_at)) ? -1 : 0));
//     //   } else if (field == 'starting_balance'? field == 'starting_balance' : field == 'amount') {
//     //     const datas = [...this.state.dataKauDetailsRecursive, ...this.state.dataKagDetailsRecursive]
//     //     datas.sort((a,b) => (a.starting_balance? a.starting_balance: a.amount >
//     //  b.starting_balance? b.starting_balance: b.amount) ? 1 : ((b.starting_balance? b.starting_balance:
//     //  b.amount > a.starting_balance? a.starting_balance: a.amount) ? -1 : 0));
//     //   }
//     //   console.log('triggered....')
//     //   }
//   }
//   render() {
//     const query = this.createQuery()
//     const { sortType } = this.state
//     // const records = this.sortedData()
//     // console.log(this.state.dataKauKag, 'this.state.dataMixed....')
//     const datas = [...this.state.dataKauDetailsRecursive, ...this.state.dataKagDetailsRecursive]
//     // console.log(datas, 'datas')
//     const sorted = datas.sort((a, b) => {
//       const isReversed = sortType === 'asc' ? 1 : -1
//       return isReversed * a.created_at.localeCompare(b.created_at)
//     })
//     console.log(sorted, 'Sorted...')
//     return (
//       <section className='section'>
//         <div className='container'>
//           <div className='tile is-vertical is-parent'>
//             <article className='tile is-child'>
//               <p className='title  is-child box' style={{ marginBottom: '1.0rem' }}>
//                 Showing results for <b>{query}</b>
//               </p>
//               <table className='table is-bordered is-striped is-fullwidth'>
//                 <thead className='thead'>
//                   <tr className='tr'>
//                     <th className='th'>
//                       Date & Time (UTC)
//                       {/* <button className = 'button' onClick={() => this.onSort('asc')} >Sort by Asc</button>
//                        <button className = 'button' onClick={() => this.onSort('desc')} >Sort by desc</button>   */}
//                     </th>
//                     <th className='th'>Hash</th>
//                     <th className='th'>From</th>
//                     <th className='th'>To</th>
//                     <th className='th'>Amount</th>
//                     <th className='th'>Fee</th>
//                     <th className='th'>Transaction Type</th>
//                   </tr>
//                 </thead>

//                 {
//                   // [
//                   //   ...this.state.dataKauKag,
//                   //   // ...this.state.dataKauDetailsRecursive,
//                   //   // ...this.state.dataKagDetailsRecursive,
//                   //   ...datas

//                   // ]
//                   sorted.slice(0, this.state.transLimit).map((record) => {
//                     const networkType = record._links.self.href.slice(11, 18) === 'testnet' ? 'T' : ''
//                     currConn = networkType + record._links.self.href.slice(7, 10).toUpperCase()
//                     const feePaid = record.fee_paid || Number(record.fee_charged)
//                     const operationBalance =
//                       record.operations?.starting_balance && parseFloat(record.operations?.starting_balance).toFixed(5)
//                     const operationAmount =
//                       record.operations?.amount && parseFloat(record.operations?.amount).toFixed(5)
//                     const precision = currConn === 'KEM' ? 7 : 5
//                     //   this.state.dataKauKag.sort((a, b) =>
//                     //   moment(a.created_at).valueOf() < moment(b.created_at).valueOf()
//                     //     ? 1
//                     //     : moment(b.created_at).valueOf() < moment(a.created_at).valueOf()
//                     //     ? -1
//                     //     : 0,
//                     // )
//                     //  console.log(record, 'rec')
//                     return (
//                       <tbody key={record.id} className='tbody'>
//                         <tr key={record.id} className='tr'>
//                           <td className='td'>
//                             {record?.created_at?.slice(8, 10)}/{record?.created_at?.slice(5, 7)}/
//                             {record?.created_at?.slice(0, 4)}&nbsp;
//                             {record?.created_at?.slice(11, 14)}
//                             {record?.created_at?.slice(14, 17)}
//                             {record?.created_at?.slice(17, 19)}

//                           </td>
//                           <td className='td'>
//                             <Link to={`/transaction/${currConn}/${record?.transaction_hash}`}>
//                               {record?.transaction_hash?.slice(0, 4)}.....{record?.transaction_hash?.substr(record?.transaction_hash?.length - 4)}
//                             </Link>
//                           </td>
//                           <td className='td'>
//                             <Link to={`/account/${record?.operations?.source_account}`}>
//                               {record?.operations?.source_account.slice(0, 4)}.....
//                               {record?.operations?.source_account.substr(record?.operations?.source_account?.length - 4)}
//                             </Link>
//                           </td>
//                           <td className='td'>

//                             {
//                               record.type === 'account_merge' ? (

//                                 <Link to={`/account/${record?.into}`}>
//                                   {record?.into.slice(0, 4)}.....
//                                   {record?.into.substr(record?.into?.length - 4)}
//                                 </Link>

//                               ) : record.type === 'create_account' ? (

//                                 <Link to={`/account/${record?.account}`}>
//                                   {record?.account.slice(0, 4)}.....
//                                   {record?.account.substr(record?.account?.length - 4)}
//                                 </Link>

//                               ) : record.type === 'payment' ? (

//                                 <Link to={`/account/${record?.to}`}>
//                                   {record?.to.slice(0, 4)}.....
//                                   {record?.to.substr(record?.to?.length - 4)}
//                                 </Link>
//                               ) : record.type === 'inflation' ? (

//                                 ''
//                               ) : (
//                                         ''
//                                       )
//                             }
//                           </td>
//                           <td>
//                             {
//                               record.type === 'account_merge' ? (


//                                 record.starting_balance

//                               ) : record.type === 'create_account' ? (

//                                 record.starting_balance

//                               ) : record.type === 'payment' ? (
//                                 record.amount

//                               ) : record.type === 'inflation' ? (

//                                 ''
//                               ) : (
//                                         ''
//                                       )
//                             }

//                           </td>
//                           <td className='td'>
//                             {/* {renderAmount(convertStroopsToKinesis(feePaid), precision)} {currConn} */}
//                           </td>
//                           <td className='td'>
//                             {startCase(record.type)}
//                           </td>
//                         </tr>
//                       </tbody>
//                     )
//                   })
//                 }
//               </table>
//               <button
//                 className='button'
//                 onClick={() => this.moreTxs()}
//                 style={{ width: '100%', marginTop: '3px', overflowAnchor: 'none' }}
//               >
//                 Load More...
//               </button>
//             </article>
//           </div>
//         </div>
//       </section>
//     )
//   }
// }

// class ConnectedTransaction extends React.Component<ConnectedTransactionProps> {
//   render() {
//     return (
//       <Subscribe to={[ConnectionContainer]}>
//         {({ state }: ConnectionContainer) => <TransactionTypePage {...this.props} {...state} />}
//       </Subscribe>
//     )
//   }
// }

// export default ConnectedTransaction

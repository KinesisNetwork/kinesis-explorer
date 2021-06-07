import { AccountMergeOperationRecord, AccountRecord, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { startCase, values } from 'lodash'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { getOperations } from '../../services/kinesis'
import OperationsTable from './OperationsTable'
let currConn: string
function renderTransaction(t: OperationRecord, conn?: string, from?: string, to?: string): JSX.Element {
  const destinationAccountAddressNetwork = t._links.self.href
  const destinationAddress = ''
  async function fetchDestinationAccountAddress() {
    const response = await fetch(`${destinationAccountAddressNetwork}/operations`)
    const url = await response.json()
    const embeddedData = url._embedded
    const records = embeddedData.records[0]
    const destinationAccount = records.into

    return destinationAccount
  }

  fetchDestinationAccountAddress().then((destinationAccount) => {
    from = destinationAccount
  })

  const networkName = t._links.self.href
  // fetch(`${networkName}/operations`)

  //   .then( async function (response) {

  //     return  await response.json()
  //     // console.log('networkName', networkName)
  //   })
  //   .then((data) => {
  //     console.log(data)
  //   }

  // console.log(from, "From")
  // const destinationAccountAddress = t._links.self.href
  // fetch(`${destinationAccountAddressNetwork}/operations`)
  // .then((response) => response.json())
  // .then((findresponse) => {
  //   this.setState({
  //     data: [findresponse],
  //   });
  // });

  const Kinesis = require('js-kinesis-sdk')
  const destinationAccountAddress = t._links.self.href

  const server = new Kinesis.Server(`${destinationAccountAddress}/operations`)
  let initialData = []
  const getOperations = async () => {
    const operationsRecord = await server.operations().limit(10).order('desc').call()
    initialData = operationsRecord.records
    /* Set your state here with initialData */
    server
      .operations()
      .cursor('now')
      .limit(1)
      .stream({
        onmessage: (nextData) => {
          initialData = [nextData, ...initialData.slice(0, 9)]
          /* Set your state here with initialData */
          console.log(nextData)
          console.log('New Length : ', initialData.length)
        },
      })
  }
  return (
    <tr key={t.id} className='tr'>
      {/* <td className="td">{t.created_at}</td>
      <td className="td">
        <Link to={`/transaction/${conn}/${t.hash}`}>
          {t.hash.slice(0, 4)}.....{t.hash.substr(t.hash.length - 4)}
        </Link>
      </td>
      <td className="td">
        <Link to={`/account/${t.source_account}`}>
          {t.source_account.slice(0, 4)}.....{t.source_account.substr(t.source_account.length - 4)}{' '}
        </Link>
      </td>
      <td className="td"> <OperationsTable   /></td> */}
      <td className='td'>{t.type}</td>
      <td className='td'>
        {/* {(t.result_xdr)}  */}
        {currConn}
      </td>
    </tr>
  )
}

interface OperationProps {
  operations: OperationRecord[]
  conn?: string

  from?: string
  to?: string
}

const Operations: React.SFC<OperationProps> = ({ operations, conn, from, to }): JSX.Element => {
  currConn = conn

  return (
    <table className='table is-bordered is-striped is-fullwidth'>
      {/* <thead className="thead">
        <tr className="tr">
          <th className="th">Date</th>
          <th className="th">Hash</th>
          <th className="th">From</th>
          <th className="th">To</th>
          <th className="th">Type</th>
          <th className="th">Amount</th>
        </tr>
      </thead> */}
      <tbody className='tbody'>
        {operations.map((operation) => renderTransaction(operation, conn, from, to))}
      </tbody>
      <tbody className='tbody'>
        <OperationsTable />
      </tbody>
    </table>
  )
}

export default Operations

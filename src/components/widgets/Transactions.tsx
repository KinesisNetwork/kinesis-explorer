import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
// import OperationsTable from './OperationsTable'
// import OperationsTableAmount from './OperationsTableAmount'
import OperationValue from './OperationValue'
let currConn: string

function renderTransaction(
  t: TransactionRecord,
  conn?: string,
  from?: string,
  to?: string,
  translimit?: number,
  operations?: any,
  // networkUrl?:string
): JSX.Element {
  const destinationAccountAddressNetwork = t._links.self.href

// let operationValues = new OperationValue(networkUrl,translimit).getOperations()

  // async function fetchDestinationAccountAddress() {
  //   const response = await fetch(`${destinationAccountAddressNetwork}/operations`)
  //   const url = await response.json()
  //   const embeddedData = url._embedded
  //   const records = embeddedData.records[0]
  //   const destinationAccount = records.into
  //   return destinationAccount
  // }

  // fetchDestinationAccountAddress().then((destinationAccount) => {
  //   from = destinationAccount
  // })
  // console.log("opData..............",JSON.stringify(operations),t,conn);
  // console.log(t, 'TransactionRecord...............')
  // console.log(conn, currConn, 'Connnnnnnnnnn...............')

  return (
    <tr key={t.id} className='tr'>
      <td className='td'>{t.created_at}</td>
      <td className='td'>
        <Link to={`/transaction/${conn}/${t.hash}`}>
          {t.hash.slice(0, 4)}.....{t.hash.substr(t.hash.length - 4)}
        </Link>
      </td>
      <td className='td'>
        <Link to={`/account/${t.source_account}`}>
          {t.source_account.slice(0, 4)}.....{t.source_account.substr(t.source_account.length - 4)}{' '}
        </Link>
      </td>
      {/* <td className="td"> */}
        {/* {' '} */}
        <OperationValue networkUrl={destinationAccountAddressNetwork} translimit={translimit} conn={conn} />
      {/* </td> */}
      {/* <td className="td"> */}
        {/* <OperationsTable networkUrl={destinationAccountAddressNetwork} translimit={translimit} /> */}
      {/* </td> */}
      {/* <td className="td"> */}
        {/* <OperationsTableAmount networkUrl={destinationAccountAddressNetwork} translimit={translimit} /> {conn} */}
      {/* </td> */}
    </tr>
  )
}
interface TransactionProps {
  transactions: TransactionRecord[]
  conn?: string
  translimit?: number
  from?: string
  to?: string
  operations?: any
}
const Transactions: React.SFC<TransactionProps> = ({
  transactions,
  conn,
  from,
  to,
  translimit,
  operations,
}): JSX.Element => {
  currConn = conn
  return (
    <table className='table is-bordered is-striped is-fullwidth'>
      <thead className='thead'>
        <tr className='tr'>
          <th className='th'>Date</th>
          <th className='th'>Hash</th>
          <th className='th'>From</th>
          <th className='th'>To</th>
          <th className='th'>Type</th>
          <th className='th'>Amount</th>
        </tr>
      </thead>
      <tbody className='tbody'>
        {transactions.map((transaction) =>
          renderTransaction(transaction, getCurrency(transaction), from, to, translimit, operations),
        )}
      </tbody>
    </table>
  )
}

const getCurrency = (transaction) => {
  // console.log('transaction?._links?.account', transaction?._links?.account?.href)

  const responseUrl = transaction?._links?.account?.href
  if (!transaction) {
    return ''
  }
  if (responseUrl?.toLowerCase().includes('kau')) {
    return 'KAU'
  } else if (responseUrl?.toLowerCase().includes('kag')) {
    return 'KAG'
  } else if (responseUrl?.toLowerCase().includes('kau')) {
    return 'TKAU'
  } else if (responseUrl?.toLowerCase().includes('kag')) {
    return 'TKAG'
  }
}

export default Transactions

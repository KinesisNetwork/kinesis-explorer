import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import OperationsTable from './OperationsTable'
import OperationsTableAmount from './OperationsTableAmount'
import OperationValue from './OperationValue'
let currConn: string

function renderTransaction(
  t: TransactionRecord,
  conn?: string,
  from?: string,
  to?: string,
  translimit?: number,
  operations?: any,
): JSX.Element {
  const destinationAccountAddressNetwork = t._links.self.href
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
      <td className='td'>
        {' '}
        <OperationValue networkUrl={destinationAccountAddressNetwork} translimit={translimit} />
      </td>
      <td className='td'>
        <OperationsTable networkUrl={destinationAccountAddressNetwork} translimit={translimit} />
      </td>
      <td className='td'>
        <OperationsTableAmount networkUrl={destinationAccountAddressNetwork} translimit={translimit} /> {currConn}
      </td>
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
        {transactions.map((transaction) => renderTransaction(transaction, conn, from, to, translimit, operations))}
      </tbody>
    </table>
  )
}

export default Transactions

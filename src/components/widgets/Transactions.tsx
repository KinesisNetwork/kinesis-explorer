import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { renderRelativeDate } from '../../utils'

function renderTransaction(t: TransactionRecord): JSX.Element {
  return (
    <tr key={t.id} className='tr'>
      <td className='td'><Link to={`/transaction/${t.id}`}>{t.id.substr(0, 22)}</Link></td>
      <td className='td'>{renderRelativeDate(t.created_at)}</td>
      <td className='td'>{t.operation_count}</td>
    </tr>
  )
}

interface TransactionProps {
  transactions: TransactionRecord[]
}

const Transactions: React.SFC<TransactionProps> = ({ transactions }): JSX.Element => {
  return (
    <div className='box'>
      <table className='table is-bordered is-striped is-fullwidth'>
        <thead className='thead'>
          <tr className='tr'>
            <th className='th'>ID</th>
            <th className='th'>Age</th>
            <th className='th'>Operations</th>
          </tr>
        </thead>
        <tbody className='tbody'>
          {transactions.map(renderTransaction)}
        </tbody>
      </table>
    </div>
  )
}

export default Transactions

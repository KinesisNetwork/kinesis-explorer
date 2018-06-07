import { LedgerRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { renderRelativeDate } from '../../utils'

interface LedgerProps {
  ledgers: LedgerRecord[]
}

function renderLedger(ledger: LedgerRecord): JSX.Element {
  return (
    <tr className='tr' key={ledger.id}>
      <td className='td'><Link to={`/ledger/${ledger.sequence}`}>{ledger.sequence}</Link></td>
      <td className='td'>{renderRelativeDate(ledger.closed_at)}</td>
      <td className='td'>{ledger.transaction_count}</td>
      <td className='td'>{ledger.operation_count}</td>
    </tr>
  )
}

const Ledgers: React.SFC<LedgerProps> = ({ ledgers }): JSX.Element => (
  <div className='box'>
    <table className='table is-bordered is-striped is-fullwidth'>
      <thead className='thead'>
        <tr className='tr'>
          <th className='th'>Sequence</th>
          <th className='th'>Age</th>
          <th className='th'>Transactions</th>
          <th className='th'>Operations</th>
        </tr>
      </thead>
      <tbody className='tbody'>
        {ledgers.map(renderLedger)}
      </tbody>
    </table>
  </div>
)

export default Ledgers

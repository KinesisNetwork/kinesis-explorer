import * as React from 'react'
import { LedgerListItem } from '../../types'
import { renderRelativeDate } from '../../utils'

function renderLedger(ledger: LedgerListItem): JSX.Element {
  return (
    <tr className='tr' key={ledger.id}>
      <td className='td'>{ledger.sequence}</td>
      <td className='td'>{renderRelativeDate(ledger.closed_at)}</td>
      <td className='td'>{ledger.transaction_count}</td>
      <td className='td'>{ledger.operation_count}</td>
    </tr>
  )
}

interface LedgerProps {
  ledgers: LedgerListItem[]
}

const Ledgers: React.SFC<LedgerProps> = ({ ledgers }): JSX.Element => {
  return (
    <article className='tile is-child notification is-primary'>
      <p className='title'>
        Ledgers
      </p>
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
            { ledgers.map(renderLedger) }
          </tbody>
        </table>
      </div>
    </article>
  )
}

export default Ledgers

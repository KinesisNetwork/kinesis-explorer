import * as React from 'react'

function formatTransaction(t: any /* Transaction */): Element {
  return (
    <tr key={t.id} className='tr'>
      <td className='td'>{t.id.substr(0, 22)}</td>
      <td className='td'>{t.created_at.toString()}</td>
      <td className='td'>{t.label}</td>
      <td className='td'>{t.amount}</td>
    </tr>
  )
}

const Transactions: React.SFC = (props: any) => {
  return (
    <article className='tile is-child notification is-primary'>
      <p className='title'>
        Transactions
      </p>
      <div className='box'>
        <table className='table is-bordered is-striped is-fullwidth'>
          <thead className='thead'>
            <tr className='tr'>
              <th className='th'>ID</th>
              <th className='th'>Age</th>
              <th className='th'>Type</th>
              <th className='th'>Value</th>
            </tr>

          </thead>
          <tbody className='tbody'>
            { props.transactions.map(formatTransaction)}
          </tbody>
        </table>
      </div>
    </article>
  )
}

export default Transactions

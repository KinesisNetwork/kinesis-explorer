import * as React from 'react'

const Ledgers: React.SFC = (props: any) => {
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
            <tr className='tr'>
              <td className='td'>1</td>
              <td className='td'>Old</td>
              <td className='td'>10</td>
              <td className='td'>15</td>
            </tr>
            <tr className='tr'>
              <td className='td'>2</td>
              <td className='td'>Older</td>
              <td className='td'>17</td>
              <td className='td'>25</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  )
}

export default Ledgers

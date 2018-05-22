import * as React from 'react'

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
            <tr className='tr'>
              <td className='td'>1</td>
              <td className='td'>Old</td>
              <td className='td'>Create Account</td>
              <td className='td'>15</td>
            </tr>
            <tr className='tr'>
              <td className='td'>2</td>
              <td className='td'>Older</td>
              <td className='td'>Payment</td>
              <td className='td'>25</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  )
}

export default Transactions

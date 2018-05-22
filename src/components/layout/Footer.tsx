import * as React from 'react'

const Footer: React.SFC = (props: any) => {
  return (
    <div className='hero-foot'>
      <nav className='tabs is-centered is-boxed'>
        <div className='container'>
          <ul>
            <li className='is-active'><a>Overview</a></li>
            <li><a>Ledgers</a></li>
            <li><a>Transactions</a></li>
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default Footer

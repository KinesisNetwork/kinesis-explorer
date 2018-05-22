import * as React from 'react'
import icon from '../../../icon.png'

const Navigation: React.SFC = (props: any) => {
  return (
    <div className='hero-head'>
      <nav className='navbar' role='navigation' aria-label='navigation'>
        <div className='container'>
          <div className='navbar-brand'>
            <a className='navbar-item'>
              <img src={icon} alt='Logo' />
            </a>
            <span className='navbar-burger burger' data-target='navbarMenuHeroA'>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
          <div id='navbarMenuHeroA' className='navbar-menu'>
            <div className='navbar-start'>
              <a className='navbar-item'>
                Kinesis Explorer
              </a>
            </div>
            <div className='navbar-end'>
              <a className='navbar-item is-active'>
                Home
              </a>
              <a className='navbar-item'>
                Switch to TESTNET
              </a>
              <div className='navbar-item'>
                <div className='field'>
                  <div className='control has-icons-right'>
                    <input className='input' type='text' placeholder='Search...' />
                    <span className='icon is-right'>
                      <i className='fas fa-search' />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navigation

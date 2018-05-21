import * as React from 'react'
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import NotFound from './NotFound'
import icon from '../../icon.png'

export default class App extends React.Component<null, null> {
  render() {
    return (
      <div>
        {/* <Navigation /> */}
        <section className='hero is-primary is-fullheight'>
          <div className='hero-head'>
            <nav className='navbar'>
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
                  <div className='navbar-end'>
                    <a className='navbar-item is-active'>
                      Home
                    </a>
                    <a className='navbar-item'>
                      Examples
                    </a>
                    <a className='navbar-item'>
                      Documentation
                    </a>
                    <span className='navbar-item'>
                      <a className='button is-primary is-inverted'>
                        <span className='icon'>
                          <i className='fab fa-github'></i>
                        </span>
                        <span>Download</span>
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* <!-- Hero content: will be in the middle --> */}
          <div className='hero-body'>
            <div className='container has-text-centered'>
              <h1 className='title'>
                Title
              </h1>
              <h2 className='subtitle'>
                Subtitle
              </h2>
            </div>
          </div>

          {/* <!-- Hero footer: will stick at the bottom --> */}
          <div className='hero-foot'>
            <nav className='tabs'>
              <div className='container'>
                <ul>
                  <li className='is-active'><a>Overview</a></li>
                  <li><a>Modifiers</a></li>
                  <li><a>Grid</a></li>
                  <li><a>Elements</a></li>
                  <li><a>Components</a></li>
                  <li><a>Layout</a></li>
                </ul>
              </div>
            </nav>
          </div>
        </section>
        <Router basename='/'>
          <Switch>
            <Route exact path='/' component={() => <h1 className='is-1'>Main Page</h1> } />
            <Route path='/404' component={NotFound}/>
            <Redirect to='/404' />
          </Switch>
        </Router>
      </div>
    )
  }
}

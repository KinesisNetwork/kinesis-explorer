import * as React from 'react'
import Navigation from './Navigation'

interface AppLayoutProps {
  children: JSX.Element,
}

class AppLayout extends React.Component<AppLayoutProps> {
  render() {
    return (
      <section className='hero is-fullheight'>
        <div className='hero-head'>
          <Navigation />
        </div>
        <div className='hero-body'>
          <div className='container has-text-centered'>
            { this.props.children }
          </div>
        </div>
        <div className='hero-foot'>
        </div>
      </section>
    )
  }
}

export default AppLayout

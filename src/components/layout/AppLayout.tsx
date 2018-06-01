import * as React from 'react'
import Navigation from './Navigation'
import Footer from './Footer'

interface AppLayoutProps {
  children: JSX.Element,
}

class AppLayout extends React.Component<AppLayoutProps> {
  render() {
    return (
      <section className='hero is-primary is-fullheight is-bold'>
        <Navigation />
        <div className='hero-body'>
          <div className='container has-text-centered'>
            { this.props.children }
          </div>
        </div>
        <div className='hero-foot'>
          <Footer />
        </div>
      </section>
    )
  }
}

export default AppLayout

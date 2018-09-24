import * as React from 'react'
import Navigation from './Navigation'

interface AppLayoutProps {
  children: JSX.Element
}

class AppLayout extends React.Component<AppLayoutProps> {
  render() {
    return (
      <section>
        <Navigation />
        <div className='container has-text-centered'>{this.props.children}</div>
      </section>
    )
  }
}

export default AppLayout

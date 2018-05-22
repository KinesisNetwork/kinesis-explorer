import * as React from 'react'
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import NotFound from './NotFound'
import Navigation from './layout/Navigation'
import Header from './layout/Header'
import Footer from './layout/Footer'
import { CashMoneyGamble, Converter, Ledgers, Statistics, Transactions } from './widgets'

interface DashboardProps {
   history: any,
   location: any,
   match: any,
   staticContext: any,
}

interface DashboardState {}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {
  render() {
    console.log('Dashboard props', this.props)
    return (
      <section className='hero is-primary is-fullheight is-bold'>
        <Navigation />
        <div className='hero-body'>
          <div className='container is-fluid has-text-centered'>
            <Header />
            <div className='tile is-ancestor'>
              <div className='tile is-vertical is-4 is-parent'>
                <Statistics />
                <Converter  />
                <CashMoneyGamble  />
              </div>
              <div className='tile is-vertical is-parent'>
                <Ledgers />
                <Transactions />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </section>
    )
  }
}

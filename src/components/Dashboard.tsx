import * as React from 'react'
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import { Network, Server, Transaction, TransactionRecord } from 'js-kinesis-sdk'
import NotFound from './NotFound'
import Navigation from './layout/Navigation'
import Header from './layout/Header'
import Footer from './layout/Footer'
import { CashMoneyGamble, Converter, Ledgers, Statistics, Transactions } from './widgets'
import { Connection, TransactionOperationView } from '../types'
import { flatten } from '../utils'
import { DEFAULT_CONNECTIONS } from '../services/connections'
import { getServer, getTransactionStream } from '../services/kinesis'
const STROOPS_IN_ONE_KINESIS = 10000000

interface DashboardProps {
   history: any,
   location: any,
   match: any,
   staticContext: any,
}

interface DashboardState {
  initialData: any[],
  ledgers: any[],
  streamData: any,
  transactions: any[],
}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props)
    this.state = {
      initialData: [],
      streamData: '',
      transactions: [],
      ledgers: [],
    }

  }

  public transactionStream: any

  componentDidMount(): void {
    const server: Server = getServer(DEFAULT_CONNECTIONS[0])

    this.transactionStream = getTransactionStream({
      server,
      handleLoadData: this.handleLoadData('transactions'),
      handleStreamData: this.handleStreamData('transactions')
    })
  }

  componentWillUnmount() {
    this.transactionStream.close()
  }

  handleLoadData = (dataType: string) => (initialData: any[]): void => {
    this.setState((prevState: DashboardState) => ({ ...prevState, [dataType]: initialData }))
  }

  handleStreamData = (dataType: string) => (nextData: any): void => {
    this.setState((prevState: DashboardState) => {
      const updatedData: any[] = [ nextData, ...prevState[dataType].slice(0, 10)]
      return ({
        ...prevState,
        [dataType]: updatedData
      })
    })
  }

  render() {
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
                <Transactions transactions={this.state.transactions}/>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </section>
    )
  }
}

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
import { Connection, LedgerListItem, TransactionOperationView, TransactionListItem } from '../types'
import { flatten } from '../utils'
import { DEFAULT_CONNECTIONS } from '../services/connections'
import { getServer, getLedgerStream, getTransactionStream } from '../services/kinesis'
const STROOPS_IN_ONE_KINESIS = 10000000

interface DashboardProps {
  history: any,
  location: any,
  match: any,
  staticContext: any,
}

interface DashboardState {
  ledgers: LedgerListItem[],
  transactions: TransactionListItem[],
}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {

  state = {
    transactions: [],
    ledgers: [],
  }

  public paymentStream: any
  public transactionStream: any
  public ledgerStream: any

  async componentDidMount(): Promise<void> {
    const server: Server = getServer(DEFAULT_CONNECTIONS[0] as Connection)

    this.transactionStream = await getTransactionStream({
      server,
      handleLoadData: this.handleLoadData('transactions'),
      handleStreamData: this.handleStreamData('transactions')
    })

    this.ledgerStream = await getLedgerStream({
      server,
      handleLoadData: this.handleLoadData('ledgers'),
      handleStreamData: this.handleStreamData('ledgers')
    })
  }

  componentWillUnmount() {
    this.transactionStream.close()
    this.ledgerStream.close()
    this.paymentStream.close()
  }

  handleLoadData = (dataType: string) => (initialData: any[]): void => {
    this.setState((prevState: DashboardState) => ({ ...prevState, [dataType]: initialData }))
  }

  handleStreamData = (dataType: string) => async (nextData: any): Promise<void> => {
    this.setState((prevState: DashboardState) => {
      const updatedData: any[] = [ nextData, ...prevState[dataType].slice(0, 9)]
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
                <Ledgers ledgers={this.state.ledgers} />
                <Transactions transactions={this.state.transactions} />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </section>
    )
  }
}

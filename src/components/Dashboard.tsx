import * as React from 'react'
import { LedgerRecord, TransactionRecord } from 'js-kinesis-sdk'
import Navigation from './layout/Navigation'
import Header from './layout/Header'
import Footer from './layout/Footer'
import { CashMoneyGamble, Converter, Ledgers, Statistics, Transactions } from './widgets'
import { Connection } from '../types'
import { DEFAULT_CONNECTIONS } from '../services/connections'
import {
  getServer,
  getLedgers,
  getLedgerStream,
  getTransactions,
  getTransactionStream
} from '../services/kinesis'

interface DashboardProps {
  history: any,
  location: any,
  match: any,
  staticContext: any,
}

interface DashboardState {
  ledgers: LedgerRecord[],
  selectedConnection: Connection,
  transactions: TransactionRecord[],
}

type EntityType = 'ledgers' | 'transactions'

enum Entity {
  ledgers = 'ledgers',
  transactions = 'transactions'
}

class Dashboard extends React.Component<DashboardProps, DashboardState> {

  state = {
    ledgers: [],
    selectedConnection: DEFAULT_CONNECTIONS[1],
    transactions: [],
  }

  closeTransactionStream: () => void
  closeLedgerStream: () => void

  componentDidMount() {
    this.fetchData()
  }

  componentWillUnmount() {
    this.closeDataStreams()
  }

  fetchData = async (): Promise<void> => {
    const ledgers = await getLedgers(this.state.selectedConnection)
    const transactions = await getTransactions(this.state.selectedConnection)

    this.setState((prevState: DashboardState) => ({ ...prevState, ledgers, transactions }))

    const ledgerCursor: string = (ledgers[0] || {}).paging_token
    const transactionCursor: string = (transactions[0] || {}).paging_token

    const ledgerResponse = await getLedgerStream(this.state.selectedConnection, ledgerCursor)
    const transactionResponse =  await getTransactionStream(this.state.selectedConnection, transactionCursor)

    this.closeLedgerStream = ledgerResponse.stream({ onmessage: this.handleStreamData(Entity.ledgers) })
    this.closeTransactionStream = transactionResponse.stream({ onmessage: this.handleStreamData(Entity.transactions) })
  }

  closeDataStreams = (): void => {
    if (this.closeTransactionStream) this.closeTransactionStream()
    if (this.closeLedgerStream) this.closeLedgerStream()
  }

  handleLoadData = (dataType: EntityType) => (initialData: LedgerRecord[] | TransactionRecord[]): void => {
    this.setState((prevState: DashboardState) => ({ ...prevState, [dataType]: initialData }))
  }

  handleStreamData = (dataType: EntityType) => (nextData: LedgerRecord | TransactionRecord): void => {
    this.setState((prevState: DashboardState) => {
      const updatedData: any[] = [ nextData, ...prevState[dataType].slice(0, 9) ]
      return ({
        ...prevState,
        [dataType]: updatedData
      })
    })
  }

  handleConnectionChange = async (connection: Connection): Promise<void> => {
    await this.closeDataStreams()
    await this.setState((state: DashboardState) => ({
      ...state,
      ledgers: [],
      selectedConnection: connection,
      transactions: [],
    }))
    await this.fetchData()
  }

  render() {
    return (
      <section className='hero is-primary is-fullheight is-bold'>
        <Navigation
          connections={DEFAULT_CONNECTIONS}
          selectedConnection={this.state.selectedConnection}
          onConnectionChange={this.handleConnectionChange}
        />
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

export default Dashboard

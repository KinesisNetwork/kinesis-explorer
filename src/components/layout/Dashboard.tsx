import { LedgerRecord, TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { Subscribe } from 'unstated'
import {
  ConnectionContainer,
  ConnectionContext,
} from '../../services/connections'
import {
  getLedgers,
  getLedgerStream,
  getTransactions,
  getTransactionStream,
} from '../../services/kinesis'
import { Converter, Ledgers, Statistics, Transactions } from '../widgets'

interface ConnectedDashboardProps extends RouteComponentProps<undefined> { }
interface DashboardProps extends ConnectedDashboardProps, ConnectionContext { }

interface DashboardState {
  ledgers: LedgerRecord[]
  transactions: TransactionRecord[]
  isLoading: boolean
  ledgerLimit: number
  transLimit: number
}

enum Entity {
  ledgers = 'ledgers',
  transactions = 'transactions',
}

type EntityType = keyof typeof Entity

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  state = {
    ledgers: [],
    transactions: [],
    isLoading: false,
    ledgerLimit: 10,
    transLimit: 10,
  }

  closeLedgerStream!: () => void
  closeTransactionStream!: () => void

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(prevProps: DashboardProps, prevState: DashboardState) {
    if (prevProps.selectedConnection !== this.props.selectedConnection) {
      this.handleConnectionChange()
    }
    if (prevState.transLimit !== this.state.transLimit || prevState.ledgerLimit !== this.state.ledgerLimit) {
      this.closeTransactionStream()
      this.updateTransaction()
    }
  }

  componentWillUnmount() {
    this.closeDataStreams()
  }

  fetchData = async (): Promise<void> => {
    this.setState({ isLoading: true })
    const [ledgers, transactions] = await Promise.all([
      getLedgers(this.props.selectedConnection, this.state.ledgerLimit),
      getTransactions(this.props.selectedConnection, undefined, this.state.transLimit),
    ])

    this.setState({ ledgers, transactions, isLoading: false })

    const ledgerCursor: string = (ledgers[0] || {}).paging_token
    const transactionCursor: string = (transactions[0] || {}).paging_token

    const ledgerResponse = await getLedgerStream(
      this.props.selectedConnection,
      ledgerCursor,
    )
    const transactionResponse = await getTransactionStream(
      this.props.selectedConnection,
      transactionCursor,
    )

    this.closeLedgerStream = ledgerResponse.stream({
      onmessage: this.handleStreamData(Entity.ledgers),
    })
    this.closeTransactionStream = transactionResponse.stream({
      onmessage: this.handleStreamData(Entity.transactions),
    })
  }

  closeDataStreams = (): void => {
    if (this.closeTransactionStream) {
      this.closeTransactionStream()
    }
    if (this.closeLedgerStream) {
      this.closeLedgerStream()
    }
  }

  handleLoadData = (dataType: EntityType) => (
    initialData: LedgerRecord[] | TransactionRecord[],
  ): void => {
    this.setState((state: DashboardState) => ({
      ...state,
      [dataType]: initialData,
    }))
  }

  handleStreamData = (dataType: EntityType) => (nextData: LedgerRecord | TransactionRecord): void => {
    this.setState((state: DashboardState) => {
      let updatedData: any[] = []
      if (dataType === 'ledgers') {
        updatedData = [nextData, ...state[dataType].slice(0, this.state.ledgerLimit - 1)]
      } else {
        updatedData = [nextData, ...state[dataType].slice(0, this.state.transLimit - 1)]
      }
      return {
        ...state,
        [dataType]: updatedData,
      }
    })
  }

  handleConnectionChange = (): void => {
    this.state.transLimit = 10
    this.state.ledgerLimit = 10
    this.closeDataStreams()
    this.fetchData()
  }

  moreLedgers() {
    this.setState((prev: DashboardState) => ({
      ...prev, ledgerLimit: prev.ledgerLimit + 10,
    }))
  }

  moreTxs() {
    this.setState((prev: DashboardState) => ({
      ...prev, transLimit: prev.transLimit + 10,
    }))
  }

  updateTransaction = async (): Promise<void> => {
    const transactions = await getTransactions(this.props.selectedConnection, undefined, this.state.transLimit)

    this.setState({ transactions })

    const transactionCursor: string = (transactions[0] || {}).paging_token

    const transactionResponse = await getTransactionStream(
      this.props.selectedConnection,
      transactionCursor,
    )

    this.closeTransactionStream = transactionResponse.stream({
      onmessage: this.handleStreamData(Entity.transactions),
    })
  }

  updateLedger = async (): Promise<void> => {
    const ledgers = await getLedgers(this.props.selectedConnection, this.state.ledgerLimit)

    this.setState({ ledgers })

    const ledgerCursor: string = (ledgers[0] || {}).paging_token

    const ledgerResponse = await getLedgerStream(
      this.props.selectedConnection,
      ledgerCursor,
    )

    this.closeLedgerStream = ledgerResponse.stream({
      onmessage: this.handleStreamData(Entity.ledgers),
    })
  }

  connectionSelector(): string {
    if (this.props.selectedConnection.name === 'Kinesis KAU Mainnet') {
      return 'KAU'
    } else if (this.props.selectedConnection.name === 'Kinesis KAG Mainnet') {
      return 'KAG'
    } else if (this.props.selectedConnection.name === 'Kinesis KAU Testnet') {
      return 'TKAU'
    } else if (this.props.selectedConnection.name === 'Kinesis KAG Testnet') {
      return 'TKAG'
    } else { return 'KAU' }
  }

  render() {
    return (
      <section className='section'>
        <div className='tile is-ancestor'>
          <div className='tile is-vertical is-4 is-parent'>
            <Statistics />
            <Converter />
          </div>
          <div className='tile is-vertical is-parent'>
            <article className='tile is-child'>
              <p className='title'>Ledgers</p>
              <div className={this.state.isLoading ? 'is-loading-blur' : ''}>
                <Ledgers ledgers={this.state.ledgers} />
              </div>
            </article>
            <article className='tile is-child'>
              <p className='title'>Transactions</p>
              <div className={this.state.isLoading ? 'is-loading-blur' : ''}>
                <Transactions transactions={this.state.transactions} conn={this.connectionSelector()} />
              </div>
              <button className='button' onClick={() => this.moreTxs()} style={{ width: '100%', marginTop: '3px', overflowAnchor: 'none' }}>
                Load More...
              </button>
            </article>
          </div>
        </div>
      </section>
    )
  }
}

class ConnectedDashboard extends React.Component<ConnectedDashboardProps> {
  render() {
    return (
      <Subscribe to={[ConnectionContainer]}>
        {({ state }: ConnectionContainer) => (
          <Dashboard {...this.props} {...state} />
        )}
      </Subscribe>
    )
  }
}

export default ConnectedDashboard

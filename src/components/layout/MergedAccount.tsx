import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { getTransactions } from '../../services/kinesis'
import { Transactions } from '../widgets'

interface ConnectedAccountProps extends RouteComponentProps<{ id: string }> { }
interface Props extends ConnectedAccountProps, ConnectionContext { }

interface State {
  transactions: TransactionRecord[]
  invalidAccount: boolean
  translimit?: number
}

class MergedAccountPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      transactions: [],
      invalidAccount: false,

    }
  }

  loadTransactions = async () => {
    try {
      const transactions = await this.fetchTransactions()
      this.setState({ transactions })
    } catch (e) {
      this.setState({ invalidAccount: true })
    }
  }

  async fetchTransactions(transactions: TransactionRecord[] = [], cursor?: string): Promise<TransactionRecord[]> {
    const accountId = this.props.match.params.id

    const fetchedTransactions = await getTransactions(this.props.selectedConnection, accountId, 200, cursor)
    const combinedTransactions = transactions.concat(fetchedTransactions)

    if (fetchedTransactions.length === 200) {
      return await this.fetchTransactions(
        combinedTransactions,
        fetchedTransactions[fetchedTransactions.length - 1].paging_token,
      )
    } else {
      return combinedTransactions
    }
  }

  componentDidMount() {
    this.loadTransactions()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.loadTransactions()
    }
  }

  render() {
    const { match } = this.props
    const { transactions } = this.state
    // const { translimit } = this.props

    const accountId = match.params.id

    if (this.state.invalidAccount) {
      return <Redirect to='/404' />
    }

    return (
      <section className='section'>
        <h1 className='title'>Merged Account</h1>
        <h2 className='subtitle'>{accountId}</h2>
        <Transactions transactions={transactions} />
      </section>
    )
  }
}

class ConnectedAccount extends React.Component<ConnectedAccountProps> {
  render() {
    return (
      <Subscribe to={[ConnectionContainer]}>
        {({ state }: ConnectionContainer) => <MergedAccountPage {...this.props} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedAccount

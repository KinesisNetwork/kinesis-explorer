import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { TransactionRecord } from 'js-kinesis-sdk'
import { Subscribe } from 'unstated'
import { ConnectionContext, ConnectionContainer } from '../../services/connections'
import { getTransaction } from '../../services/kinesis'
import { Connection } from '../../types'
import { TransactionInfo } from '../widgets/TransactionInfo'

interface ConnectedTransactionProps extends RouteComponentProps<{ id: string }> {}
interface Props extends ConnectedTransactionProps, ConnectionContext {}

interface State {
  transaction: TransactionRecord | null
  invalidTransaction: boolean
}

class TransactionPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { transaction: null, invalidTransaction: false }
  }

  loadTransaction = async () => {
    try {
      const transaction = await getTransaction(this.props.selectedConnection, this.props.match.params.id)
      this.setState({ transaction })
    } catch (e) {
      this.setState({ invalidTransaction: true })
    }
  }

  componentDidMount() {
    this.loadTransaction()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.loadTransaction()
    }
  }

  render() {
    if (this.state.invalidTransaction) {
      return <Redirect to='/404' />
    }
    return (
      <section className='section'>
        <div className='container'>
          <h1 className='title'>Transaction</h1>
          <h2 className='subtitle'>{this.props.match.params.id}</h2>
          {!this.state.transaction ? <div /> : <TransactionInfo transaction={this.state.transaction} />}
        </div>
      </section>
    )
  }
}

class ConnectedTransaction extends React.Component<ConnectedTransactionProps> {
  render() {
    return (
      <Subscribe to={[ ConnectionContainer ]}>
        { ({ state }: ConnectionContainer) => <TransactionPage {...this.props} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedTransaction

import * as React from 'react'

import { TransactionRecord } from 'js-kinesis-sdk'
import { Redirect, RouteComponentProps } from 'react-router'
import { DEFAULT_CONNECTIONS } from '../../services/connections'
import { getTransaction } from '../../services/kinesis'
import { Connection } from '../../types'
import { TransactionInfo } from '../widgets/TransactionInfo'

interface Props extends RouteComponentProps<{ id: string }> {
  connection: Connection
}
interface State {
  transaction: TransactionRecord | null
  invalidTransaction: boolean
}
export class TransactionPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { transaction: null, invalidTransaction: false }
  }

  loadTransaction = async () => {
    try {
      const transaction = await getTransaction(DEFAULT_CONNECTIONS[1], this.props.match.params.id)
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

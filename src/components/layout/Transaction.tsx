import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext  } from '../../services/connections'
import { getTransaction } from '../../services/kinesis'
import { Connection } from '../../types'
import { TransactionInfo } from '../widgets/TransactionInfo'
interface ConnectedTransactionProps extends RouteComponentProps<{ id: string; connection: string }> {}
interface Props extends ConnectedTransactionProps, ConnectionContext {}

interface State {
  transaction: TransactionRecord | null
  invalidTransaction: boolean
  conn: string | undefined
  selectedConnectionName: Connection | undefined
}

class TransactionPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { transaction: null, invalidTransaction: false, conn: undefined, selectedConnectionName: undefined  }
  }

  getId = (val: string) => {
    if (val === 'KAU') {
      return 0
    } else if (val === 'KAG') {
      return 1
    } else if (val === 'TKAU') {
      return 2
    } else if (val === 'TKAG') {
      return 3
    }
  }

  loadTransaction = async () => {

    try {
      const activeConn = this.getId(this.props.match.params.connection)!

      console.log(this.props.match.params.connection, 'MATCH')

      let transaction: TransactionRecord

      this.props.connections.forEach(async (element) => {

        try {
          // const { selectedConnection } = this.props

          const value = await getTransaction(element, this.props.match.params.id)
          console.log(value, 'VALUE')
          console.log(this.props.selectedConnection.name, 'selectedConnection')
          console.log('element', element )
          this.setState({ transaction: value, selectedConnectionName: element })
        //   this.setState({
        //     selectedConnectionName : {...this.props.selectedConnection,[this.props.selectedConnection.name]: element}
        // })
          // console.log(selectedConnection, "SE")
        } catch {}
      })

      console.log('Transaction', transaction)
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
          {!this.state.transaction ? (
            <div />
          ) : (
            <TransactionInfo transaction={this.state.transaction} conn={this.props.match.params.connection} />
          )}
        </div>
      </section>
    )
  }
}

class ConnectedTransaction extends React.Component<ConnectedTransactionProps> {

  render() {
    return (
      <Subscribe to={[ConnectionContainer]}>
        {({ state }: ConnectionContainer) => (
          <TransactionPage {...this.props} {...state} />)}
      </Subscribe>
    )
  }
}

export default ConnectedTransaction

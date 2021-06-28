import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
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
    this.state = { transaction: null, invalidTransaction: false, conn: undefined, selectedConnectionName: undefined }
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
      const element =   this.props.selectedConnection
      try {
          const value = await getTransaction(element, this.props.match.params.id)
          this.setState({ transaction: value, selectedConnectionName: element })
        } catch (err) {
          // tslint:disable-next-line:no-console
          console.error(err)
        }
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
            <TransactionInfo
             transaction={this.state.transaction}
             conn={this.props.match.params.connection}
             selectedConnection={this.props.selectedConnection}
            />
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
        {({ state }: ConnectionContainer) => <TransactionPage {...this.props} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedTransaction

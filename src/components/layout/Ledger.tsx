import { LedgerRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { getLedger } from '../../services/kinesis'
import { Connection } from '../../types'
import { LedgerInfo } from '../widgets/LedgerInfo'

interface ConnectedLedgerProps extends RouteComponentProps<{ sequence: string }> {}
interface Props extends ConnectedLedgerProps, ConnectionContext {}

interface State {
  ledger: LedgerRecord | null
  invalidLedger: boolean
}

class LedgerPage extends React.Component<Props, State> {
  state: State = {
    ledger: null,
    invalidLedger: false,
  }

  componentDidMount() {
    this.loadLedger()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.match.params.sequence !== this.props.match.params.sequence) {
      this.loadLedger()
    }
  }

  loadLedger = async () => {
    try {
      const ledger = await getLedger(this.props.selectedConnection, this.props.match.params.sequence)
      this.setState({ ledger })
    } catch (e) {
      this.setState({ invalidLedger: true })
    }
  }

  render() {
    if (this.state.invalidLedger) {
      return <Redirect to='/404' />
    }
    return (
      <section className='section'>
        <h1 className='title'>Ledger</h1>
        <h2 className='subtitle'>{this.props.match.params.sequence}</h2>
        {!this.state.ledger ? <div /> : <LedgerInfo ledger={this.state.ledger} />}
      </section>
    )
  }
}

class ConnectedLedger extends React.Component<ConnectedLedgerProps> {
  render() {
    return (
      <Subscribe to={[ ConnectionContainer ]}>
        {({ state }: ConnectionContainer) => <LedgerPage {...this.props} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedLedger

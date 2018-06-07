import { AccountRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { getAccount } from '../../services/kinesis'
import { Connection } from '../../types'
import { AccountInfo } from '../widgets/AccountInfo'

interface ConnectedAccountProps extends RouteComponentProps<{ id: string }> {}
interface Props extends ConnectedAccountProps, ConnectionContext {}

interface State {
  account: AccountRecord | null
  invalidAccount: boolean
}

class AccountPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      account: null,
      invalidAccount: false,
    }
  }

  loadAccount = async () => {
    try {
      const account = await getAccount(this.props.selectedConnection, this.props.match.params.id)
      this.setState({ account })
    } catch (e) {
      this.setState({ invalidAccount: true })
    }
  }

  componentDidMount() {
    this.loadAccount()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.loadAccount()
    }
  }

  render() {
    if (this.state.invalidAccount) {
      return <Redirect to='/404' />
    }
    return (
      <section className='section'>
        <h1 className='title'>Account</h1>
        <h2 className='subtitle'>{this.props.match.params.id}</h2>
        {!this.state.account ? <div /> : <AccountInfo account={this.state.account} />}
      </section>
    )
  }
}

class ConnectedAccount extends React.Component<ConnectedAccountProps> {
  render() {
    return (
      <Subscribe to={[ ConnectionContainer ]}>
        {({ state }: ConnectionContainer) => <AccountPage {...this.props} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedAccount

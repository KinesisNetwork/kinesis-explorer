import { AccountRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { getAccount, validateAccount } from '../../services/kinesis'
import { createEmptyBalanceAccountRecord } from '../../utils'
import { AccountInfo } from '../widgets/AccountInfo'

interface ConnectedAccountProps extends RouteComponentProps<{ id: string }> { }
interface Props extends ConnectedAccountProps, ConnectionContext { }

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
    const accountId = this.props.match.params.id

    try {
      const isAccountAddressValid: boolean = await validateAccount(accountId)
      if (!isAccountAddressValid) {
        return this.setState({ invalidAccount: true })
      } else {
        // In the scenario required, should add /transactions to URI to access deactivated account
        await this.getAccountDetailsOrUseEmptyBalanceAccount(accountId)
      }
    } catch (e) {
      this.setState({ invalidAccount: true })
      return
    }
  }

  getAccountDetailsOrUseEmptyBalanceAccount = async (accountId: string) => {
    try {
      const account = await getAccount(this.props.selectedConnection, accountId)
      this.setState({ account })
    } catch (e) {
      // A 404 response code will be returned when the address has been merged (during a deposit) and can't be found,
      // We want to display a balance of 0 in this case
      this.setState({
        account: createEmptyBalanceAccountRecord(accountId),
      })
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
    const { match, selectedConnection } = this.props
    const { account } = this.state

    const accountId = match.params.id

    if (this.state.invalidAccount) {
      return <Redirect to={`/merged-account/${accountId}`} />
    }

    return (
      <section className='section'>
        <h1 className='title'>Account</h1>
        <h2 className='subtitle'>{accountId}</h2>
        {!account ? (
          <div />
        ) : (
            <AccountInfo
              account={account}
              selectedConnection={selectedConnection}
            />
          )}
      </section>
    )
  }
}

class ConnectedAccount extends React.Component<ConnectedAccountProps> {
  render() {
    return (
      <Subscribe to={[ConnectionContainer]}>
        {({ state }: ConnectionContainer) => <AccountPage {...this.props} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedAccount

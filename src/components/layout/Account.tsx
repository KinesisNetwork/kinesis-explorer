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
  accountId: string | null
  accountKag: AccountRecord | null
  accountKau: AccountRecord | null
  invalidAccount: boolean
}

class AccountPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      accountId: null,
      accountKag: null,
      accountKau: null,
      invalidAccount: false,
    }
  }
  loadAccount = async () => {
    const accountId = this.props.match.params.id
    this.setState({ accountId })
    try {
      const isAccountAddressValid: boolean = await validateAccount(accountId)
      if (!isAccountAddressValid) {
        return this.setState({ invalidAccount: true })
      } else  {
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
      const accountKau = await getAccount(this.props.selectedConnection.kau, accountId)
      const accountKag = await getAccount(this.props.selectedConnection.kag, accountId)
      //  console.log('accountKag1', accountKag, accountKau)
      this.setState({ accountKag, accountKau })
      if (accountKag === undefined) {
        this.setState({
          accountKag: createEmptyBalanceAccountRecord(accountId),
        })
        if (accountKau === undefined) {
        this.setState({
          accountKau: createEmptyBalanceAccountRecord(accountId),
        })
      }
    } else if (accountKau === undefined ) {
      this.setState({
        accountKau: createEmptyBalanceAccountRecord(accountId),
      })
    } else {
        this.setState({accountKag, accountKau})
       }
    } catch (e) {
      this.setState({
        accountKau: createEmptyBalanceAccountRecord(accountId),
        accountKag: createEmptyBalanceAccountRecord(accountId),
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
    const { accountKau, accountKag } = this.state

    const accountId = match.params.id
    if (this.state.invalidAccount) {
      return <Redirect to={`/404`} />
    }
    return (
      <section className='section'>
        <h1 className='title'>Account</h1>
        <h2 className='subtitle'>{accountId}</h2>
        {!accountKag && !accountKau ? (
          <div />
       ) : (
            <AccountInfo
              accountId={accountId}
              accountKag={accountKag ? accountKag : undefined}
              accountKau={accountKau ? accountKau : undefined}
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

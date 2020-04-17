import { AccountRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { getAccount, validateAccount } from '../../services/kinesis'
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

    // Validate invalid account
    try {
      const status: boolean = await validateAccount(accountId)
      if (!status) {
        throw new Error()
      } else {
        // In the scenario required, should add /transactions to URI to access deactivated account
        try {
          const account = await getAccount(this.props.selectedConnection, accountId)
          this.setState({ account })
        } catch (e) {
          // Valid account with 0 balance
          this.setState({
            account: {
              id: accountId,
              paging_token: '',
              account_id: accountId,
              sequence: 0,
              subentry_count: 0,
              thresholds: {
                low_threshold: 0,
                med_threshold: 0,
                high_threshold: 0,
              },
              flags: {
                auth_required: false,
                auth_revocable: false,
              },
              balances: [
                {
                  balance: '0.0',
                  asset_type: 'native',
                },
              ],
              _links: {},
              signers: [],
              data: {},
              effects: () => {
                return new Promise(() => { return })
              },
              offers: () => {
                return new Promise(() => { return })
              },
              operations: () => {
                return new Promise(() => { return })
              },
              payments: () => {
                return new Promise(() => { return })
              },
              trades: () => {
                return new Promise(() => { return })
              },
            },
          })
        }
      }
    } catch (e) {
      this.setState({ invalidAccount: true })
      return
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

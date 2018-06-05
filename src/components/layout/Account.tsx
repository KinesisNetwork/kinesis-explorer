import * as React from 'react'

import { AccountRecord } from 'js-kinesis-sdk'
import { RouteComponentProps } from 'react-router'
import { DEFAULT_CONNECTIONS } from '../../services/connections'
import { getAccount } from '../../services/kinesis'
import { Connection } from '../../types'
import { AccountInfo } from '../widgets/AccountInfo'

interface Props extends RouteComponentProps<{ id: string }> {
  connection: Connection,
}

interface State {
  account: AccountRecord | null
}
export class AccountPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      account: null,
    }
  }

  loadAccount = async () => {
    const account = await getAccount(DEFAULT_CONNECTIONS[1], this.props.match.params.id)
    this.setState({ account })
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
    return (
      <section>
        <div className='container'>
          <h1 className='title'>Account</h1>
          <h2 className='subtitle'>{this.props.match.params.id}</h2>
          {!this.state.account ? <div /> : <AccountInfo account={this.state.account} />}
        </div>
      </section>
    )
  }
}

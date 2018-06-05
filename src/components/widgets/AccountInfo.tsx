import * as React from 'react'

import { AccountRecord, CollectionPage, OperationRecord } from 'js-kinesis-sdk'
import { HorizontalLabelledField } from '../shared'
import { OperationList } from './OperationList'

interface Props {
  account: AccountRecord,
}

interface State {
  operations: CollectionPage<OperationRecord> | null
}

export class AccountInfo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      operations: null,
    }
  }

  async componentDidMount() {
    const operations = await this.props.account.operations({ limit: 10, order: 'desc' })
    this.setState({ operations })
  }

  renderBalances = () => {
    const balances = this.props.account.balances
      .map((balance) => balance.asset_type === 'native' ? { ...balance, asset_type: 'KAU' } : balance)
      .map((balance, i) => (
        <HorizontalLabelledField
          key={i}
          label={balance.asset_type}
          value={balance.balance}
        />
      ))

    return (
      <React.Fragment>
        {balances}
      </React.Fragment>
    )
  }

  render() {
    const { account } = this.props
    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical is-parent'>
          <div className='tile is-child box'>
            <p className='subtitle'>Info</p>
            <HorizontalLabelledField label='Public Key' value={account.account_id} />
          </div>
          <div className='tile is-child box'>
            <p className='subtitle'>Balances</p>
            {this.renderBalances()}
          </div>
          <OperationList operations={this.state.operations} />
        </div>
      </div>
    )
  }
}

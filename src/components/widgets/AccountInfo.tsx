import { AccountRecord, CollectionPage, OperationRecord } from 'js-kinesis-sdk'
import { startCase } from 'lodash'
import * as React from 'react'
import { Connection } from '../../types'
import { renderAmount } from '../../utils'
import { HorizontalLabelledField } from '../shared'
import { OperationList } from './OperationList'

interface Props {
  account: AccountRecord
  selectedConnection: Connection
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

  loadOperations = async () => {
    const operations = await this.props.account.operations({ limit: 10, order: 'desc' })
    this.setState({ operations })
  }

  componentDidMount() {
    this.loadOperations()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.account.account_id !== this.props.account.account_id) {
      this.loadOperations()
    }
  }

  // TODO: This will need to be abstracted with the multi network change
  renderBalances = () => {
    const balances = this.props.account.balances
      .map((balance) =>
        balance.asset_type === 'native'
          ? { ...balance, asset_type: this.props.selectedConnection.currency }
          : balance,
      )
      .map((balance) => ({ ...balance, balance: renderAmount(balance.balance) }))
      .map((balance, i) => (
        <HorizontalLabelledField key={i} label={balance.asset_type} value={balance.balance} />
      ))

    return <React.Fragment>{balances}</React.Fragment>
  }

  renderThresholds = () => {
    const thresholds = Object.entries(this.props.account.thresholds).map(([key, value]) => (
      <HorizontalLabelledField key={key} label={startCase(key)} value={value} wideLabel={true} />
    ))
    return <React.Fragment>{thresholds}</React.Fragment>
  }

  renderSigners = () => {
    const signers = this.props.account.signers.map((signer, i) => {
      return (
        <div key={i}>
          <HorizontalLabelledField
            label="Public Key"
            value={signer.public_key}
            tag={`Weight: ${signer.weight}`}
          />
        </div>
      )
    })
    return <React.Fragment>{signers}</React.Fragment>
  }

  render() {
    const { account } = this.props
    return (
      <div className="tile is-ancestor">
        <div className="tile is-vertical">
          <div className="tile">
            <div className="tile is-parent">
              <div className="tile is-child box">
                <p className="subtitle">Info</p>
                <HorizontalLabelledField
                  label="Sequence"
                  value={account.sequence}
                  wideLabel={true}
                />
                {this.renderThresholds()}
              </div>
            </div>
            <div className="tile is-parent">
              <div className="tile is-child box">
                <p className="subtitle">Balances</p>
                {this.renderBalances()}
              </div>
            </div>
          </div>
          <div className="tile is-parent">
            <div className="tile is-child box">
              <p className="subtitle">Signers</p>
              {this.renderSigners()}
            </div>
          </div>
          <div className="tile is-parent is-vertical">
            <OperationList operations={this.state.operations} />
          </div>
        </div>
      </div>
    )
  }
}

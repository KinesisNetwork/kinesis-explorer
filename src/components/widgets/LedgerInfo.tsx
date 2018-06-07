import * as React from 'react'
import { Link } from 'react-router-dom'
import { LedgerRecord, TransactionRecord } from 'js-kinesis-sdk'
import { renderRelativeDate, renderAmount } from '../../utils'
import { HorizontalLabelledField } from '../shared'
import { Transactions } from '../widgets'

interface Props {
  ledger: LedgerRecord,
}

interface State {
  transactions: TransactionRecord[],
}

export class LedgerInfo extends React.Component<Props, State> {
  state: State = {
    transactions: [],
  }

  componentDidMount() {
    this.loadTransactions()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.ledger.sequence !== this.props.ledger.sequence) {
      this.loadTransactions()
    }
  }

  loadTransactions = async () => {
    const { records } = await this.props.ledger.transactions({ limit: 10, order: 'desc' })
    this.setState({ transactions: records })
  }

  render() {
    const { ledger } = this.props

    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical'>
          <div className='tile is-parent'>
            <div className='tile is-child box'>
              <p className='subtitle is-primary notification'>Ledger</p>
              <HorizontalLabelledField label='Sequence' value={ledger.sequence} />
              <HorizontalLabelledField label='Hash' value={ledger.hash} />
              <HorizontalLabelledField label='Closed At' value={`${ledger.closed_at} | ${renderRelativeDate(ledger.closed_at)}`} />
            </div>
          </div>
          <div className='tile'>
            <div className='tile is-parent'>
              <div className='tile is-child box'>
                <p className='subtitle is-primary notification'>Info</p>
                <HorizontalLabelledField label='Percent Fee' value={ledger.base_percentage_fee} wideLabel />
                <HorizontalLabelledField label='Fee Pool' value={ledger.fee_pool} wideLabel />
              </div>
            </div>
            <div className='tile is-parent'>
              <div className='tile is-child box'>
                <p className='subtitle is-primary notification'>Count</p>
                <HorizontalLabelledField label='Transactions' value={ledger.transaction_count} wideLabel />
                <HorizontalLabelledField label='Operations' value={ledger.operation_count} wideLabel />
              </div>
            </div>
          </div>
          <div className='tile is-parent'>
            <article className='tile is-child box'>
              <p className='subtitle is-primary notification'>Transactions</p>
              <Transactions transactions={this.state.transactions} />
            </article>
          </div>
        </div>
      </div>
    )
  }
}

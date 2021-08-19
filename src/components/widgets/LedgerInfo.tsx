import { LedgerRecord, TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { renderRelativeDate } from '../../utils'
import { HorizontalLabelledField } from '../shared'
import { Transactions } from '../widgets'

interface NewKem extends LedgerRecord {
  successful_transaction_count?: number
}
interface Props {
  ledger: NewKem
}

interface State {
  transactions: TransactionRecord[]
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
              <p className='subtitle'>Ledger</p>
              <HorizontalLabelledField label='Sequence' value={ledger.sequence} />
              <HorizontalLabelledField label='Hash' value={ledger.hash} />
              <HorizontalLabelledField
                label='Closed At'
                value={`${ledger.closed_at.slice(8, 10)}/${ledger.closed_at.slice(5, 7)}/${ledger.closed_at.slice(
                  0,
                  4,
                )}  | ${renderRelativeDate(ledger.closed_at)}`}
              />
            </div>
          </div>
          <div className='tile'>
            <div className='tile is-parent'>
              <div className='tile is-child box'>
                <p className='subtitle'>Info</p>

                <HorizontalLabelledField
                  label='Percent Fee'
                  value={ledger.base_percentage_fee || 45}
                  wideLabel={true}
                />
                {/* <HorizontalLabelledField label='Fee Pool' value={ledger.fee_pool} wideLabel={true} /> */}
              </div>
            </div>
            <div className='tile is-parent'>
              <div className='tile is-child box'>
                <p className='subtitle'>Count</p>
                <HorizontalLabelledField
                  label='Transactions'
                  value={ledger.transaction_count || ledger.successful_transaction_count}
                  wideLabel={true}
                />
                <HorizontalLabelledField label='Operations' value={ledger.operation_count} wideLabel={true} />
              </div>
            </div>
          </div>
          <div className='tile is-parent'>
            <article className='tile is-child box'>
              <p className='subtitle'>Transactions</p>
              <Transactions transactions={this.state.transactions} />
            </article>
          </div>
        </div>
      </div>
    )
  }
}

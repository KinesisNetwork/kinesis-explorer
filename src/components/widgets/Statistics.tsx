import { LedgerRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Subscribe } from 'unstated'

import {
  ConnectionContainer,
  ConnectionContext,
} from '../../services/connections'
import { getLedgers } from '../../services/kinesis'
import { getBackedFees, getUnbackedBalances, getKMSCurrencyFees, } from '../../services/statistics'
import { Connection } from '../../types'
import { renderAmount } from '../../utils'
import { HorizontalLabelledField } from '../shared/LabelledField'

type StatisticsWidgetProps = ConnectionContext
interface State {
  totalFeePool: number
  totalInCirculation: number
  isLoading: boolean
}

class StatisticsWidget extends React.Component<StatisticsWidgetProps, State> {
  state: State = {
    totalFeePool: 0,
    totalInCirculation: 0,
    isLoading: false,
  }

  componentDidMount() {
    this.loadStatisticsData(this.props.selectedConnection)
  }

  componentDidUpdate(prevProps: StatisticsWidgetProps) {
    if (this.props.selectedConnection !== prevProps.selectedConnection) {
      this.loadStatisticsData(this.props.selectedConnection)
    }
  }

  loadStatisticsData = async (connection: Connection): Promise<void> => {
    this.setState({ isLoading: true })
    const { totalCoins, feePool } = await this.fetchLatestLedger(connection)
    const unbackedBalances = await getUnbackedBalances(connection)
    const backedFeesInPool = await getBackedFees(connection)
    const kmsFees = await getKMSCurrencyFees(connection)
    const ledgerFeePool = Number(feePool)
    const unbackedFeesInPool = ledgerFeePool - backedFeesInPool
    const totalFeePool = kmsFees + backedFeesInPool

    const totalInCirculation =
      totalCoins - unbackedBalances - unbackedFeesInPool

    this.setState({
      totalInCirculation,
      totalFeePool,
      isLoading: false,
    })
  }

  fetchLatestLedger = async (
    connection: Connection,
  ): Promise<LedgerRecord & { totalCoins: number; feePool: number }> => {
    const ledgers = await getLedgers(connection)
    const latest = ledgers[0]

    return {
      ...latest,
      totalCoins: Number(latest.total_coins),
      feePool: Number(latest.fee_pool),
    }
  }

  render() {
    const { totalFeePool, totalInCirculation, isLoading } = this.state
    const {
      selectedConnection: { currency },
    } = this.props
    return (
      <article className='tile is-child box'>
        <p className='title'>Statistics</p>
        <div>
          <HorizontalLabelledField
            label={'Kinesis in Circulation'}
            wideLabel={true}
            value={`${currency} ${renderAmount(totalInCirculation)}`}
            isLoading={isLoading}
          />
          <HorizontalLabelledField
            label={'Total Fee Pool'}
            wideLabel={true}
            value={`${currency} ${renderAmount(totalFeePool)}`}
            isLoading={isLoading}
          />
        </div>
      </article>
    )
  }
}

export default class ConnectedStatistics extends React.Component {
  render() {
    return (
      <Subscribe to={[ConnectionContainer]}>
        {({ state }: ConnectionContainer) => <StatisticsWidget {...state} />}
      </Subscribe>
    )
  }
}

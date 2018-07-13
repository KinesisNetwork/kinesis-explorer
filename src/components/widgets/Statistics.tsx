import { LedgerRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Subscribe } from 'unstated'

import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { getLedgers } from '../../services/kinesis'
import { getUnbackedBalances, getUnbackedFees } from '../../services/statistics'
import { Connection } from '../../types'
import { renderAmount } from '../../utils'
import { HorizontalLabelledField } from '../shared/LabelledField'

type StatisticsWidgetProps = ConnectionContext
interface State {
  totalFeePool: number,
  totalInCirculation: number,
}

class StatisticsWidget extends React.Component<StatisticsWidgetProps, State> {
  state = {
    totalFeePool: 0,
    totalInCirculation: 0,
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
    const { totalCoins, feePool } = await this.fetchLatestLedger(connection)

    const unbackedBalances = await getUnbackedBalances(connection)
    const totalInCirculation = totalCoins - unbackedBalances

    const unbackedFees = await getUnbackedFees(connection)
    const totalFeePool = feePool - unbackedFees

    this.setState({ totalInCirculation, totalFeePool })
  }

  fetchLatestLedger = async (
    connection: Connection,
  ): Promise<LedgerRecord & { totalCoins: number, feePool: number }> => {
    const ledgers = await getLedgers(connection)
    const latest = ledgers[0]
    return {
      ...latest,
      totalCoins: Number(latest.total_coins),
      feePool: Number(latest.fee_pool),
    }
  }

  render() {
    const { totalFeePool, totalInCirculation } = this.state
    return (
      <article className='tile is-child box'>
        <p className='title'>Statistics</p>
        <HorizontalLabelledField
          label={'Kinesis in Circulation'}
          wideLabel={true}
          value={`KAU ${renderAmount(totalInCirculation)}`}
        />
        <HorizontalLabelledField
          label={'Total Fee Pool'}
          wideLabel={true}
          value={`KAU ${renderAmount(totalFeePool)}`}
        />
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

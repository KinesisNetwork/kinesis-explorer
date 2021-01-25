import Decimal from 'decimal.js'
import { LedgerRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Subscribe } from 'unstated'

import BigNumber from 'bignumber.js'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { getLedgers } from '../../services/kinesis'
import { getBackedFees, getUnbackedBalances } from '../../services/statistics'
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
    const [unbackedBalances, backedFeesInPool] = await Promise.all([
      getUnbackedBalances(connection),
      getBackedFees(connection),
    ])

    const ledgerFeePool = Number(feePool)
    const unbackedFeesInPool = ledgerFeePool - backedFeesInPool
    // const totalInCirculation = totalCoins - Number(unbackedBalances) - unbackedFeesInPool
    const bigNum = new BigNumber(totalCoins)
    const totalInCirculation = Number(bigNum.minus(unbackedBalances).minus(unbackedFeesInPool).toFixed(7))

    this.setState({
      totalInCirculation,
      totalFeePool: backedFeesInPool,
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
    let currAbbr: string = currency
    if ((Number(localStorage.getItem('selectedConnection')) || 0) > 2) {
      currAbbr = 'T' + currAbbr
    }
    return (
      <article className='tile is-child box'>
        <p className='title'>Statistics</p>
        <div>
          <HorizontalLabelledField
            label={'Kinesis in Circulation'}
            wideLabel={true}
            value={
              currency === 'KEM'
                ? `${currAbbr} ${renderAmount(totalInCirculation, 7)}`
                : `${currAbbr} ${renderAmount(totalInCirculation)}`
            }
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

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
import { HorizontalLabelledFieldStatistics } from '../shared/LabelledField'

type StatisticsWidgetProps = ConnectionContext
interface State {
  totalFeePool: any
  totalInCirculation: any
  isLoading: boolean
}

class StatisticsWidget extends React.Component<StatisticsWidgetProps, State> {
  state: State = {
    totalFeePool: { backedFeesInPoolKag: 0, backedFeesInPoolKau: 0 },
    totalInCirculation: { totalInCirculationKag: 0, totalInCirculationKau: 0 },
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
    console.log('in loadStatisticsData >>>>>>>>>>>>>>>> connection : ', connection)
    this.setState({ isLoading: true })
    const { totalCoins: kauTotalCoins, feePool: kauFeePool } = await this.fetchLatestLedger(connection.kau)
    const { totalCoins: kagTotalCoins, feePool: kagFeePool } = await this.fetchLatestLedger(connection.kag)
    const [kauUnbackedBalances, kagUnbackedBalances, backedFeesInPoolKag, backedFeesInPoolKau] = await Promise.all([
      getUnbackedBalances(connection.kau),
      getUnbackedBalances(connection.kag),
      getBackedFees(connection.kag),
      getBackedFees(connection.kau),
    ])
    console.log('2 in loadStatisticsData >>>>>>>>>>>>>> connection : ', kauTotalCoins, kauFeePool)
    const kauLedgerFeePool = Number(kauFeePool)
    const kagLedgerFeePool = Number(kagFeePool)
    const unbackedFeesInPoolKag = kauLedgerFeePool - backedFeesInPoolKag
    const unbackedFeesInPoolKau = kagLedgerFeePool - backedFeesInPoolKau
    // const totalInCirculation = totalCoins - Number(unbackedBalances) - unbackedFeesInPool
    const kauInBigNum = new BigNumber(kauTotalCoins)
    const kagInBigNum = new BigNumber(kagTotalCoins)
    const totalInCirculationKag = Number(kagInBigNum.minus(kagUnbackedBalances).minus(unbackedFeesInPoolKag).toFixed(7))
    const totalInCirculationKau = Number(kauInBigNum.minus(kauUnbackedBalances).minus(unbackedFeesInPoolKau).toFixed(7))

    console.log('totalInCirculationKag', this.state.totalInCirculation)
    console.log('totalInCirculationKau', totalInCirculationKau)

    this.setState({
      totalInCirculation: { totalInCirculationKag, totalInCirculationKau },
      totalFeePool: { backedFeesInPoolKag, backedFeesInPoolKau },
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
      selectedConnection: { kau, kag },
    } = this.props
    let currAbbr: string = kau.currency
    let currName: string = kag.currency
    if ((Number(localStorage.getItem('selectedConnection')) || 0) > 1) {
      currAbbr = 'T' + currAbbr
      currName = 'T' + currName
    }

    return (
      <article className="tile is-child box">
        <p className="title">Kinesis in Circulation</p>
        <div style={{ marginTop: '80%' }}>
          <HorizontalLabelledFieldStatistics
            label={''}
            wideLabel={false}
            value={
              kau.currency === 'KAU'
                ? `${currAbbr} ${renderAmount(totalInCirculation.totalInCirculationKau, 5)}`
                : `${currAbbr} ${renderAmount(totalInCirculation.totalInCirculationKau)}`
            }
            isLoading={isLoading}
          />
          <HorizontalLabelledFieldStatistics
            label={''}
            wideLabel={false}
            value={
              kag.currency === 'KAG'
                ? `${currName} ${renderAmount(totalInCirculation.totalInCirculationKag, 5)}`
                : `${currName} ${renderAmount(totalInCirculation.totalInCirculationKag)}`
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

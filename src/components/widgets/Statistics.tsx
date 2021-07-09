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
    this.setState({ isLoading: true })
    const fetLedgerResponse = await this.fetchLatestLedger(connection)
    // const { totalCoins: kagTotalCoins, feePool: kagFeePool } = await this.fetchLatestLedger(connection)
    const [kauUnbackedBalances, kagUnbackedBalances, backedFeesInPoolKau, backedFeesInPoolKag] = await Promise.all([
      // getUnbackedBalances(connection.kau),
      getUnbackedBalances(connection.kau),
      getUnbackedBalances(connection.kag),
      getBackedFees(connection.kau),
      getBackedFees(connection.kag),
    ])
    const kauLedgerFeePool = Number(fetLedgerResponse.kauFeePool)
    const kagLedgerFeePool = Number(fetLedgerResponse.kagFeePool)
    const unbackedFeesInPoolKau = kauLedgerFeePool - backedFeesInPoolKau
    const unbackedFeesInPoolKag = kagLedgerFeePool - backedFeesInPoolKag
    // const totalInCirculation = totalCoins - Number(unbackedBalances) - unbackedFeesInPool
    const kauInBigNum = new BigNumber(fetLedgerResponse.totalCoinsKau)
    const kagInBigNum = new BigNumber(fetLedgerResponse.totalCoinsKag)
    const totalInCirculationKau = Number(kauInBigNum.minus(kauUnbackedBalances).minus(unbackedFeesInPoolKau).toFixed(5))
    const totalInCirculationKag = Number(kagInBigNum.minus(kagUnbackedBalances).minus(unbackedFeesInPoolKag).toFixed(5))

    this.setState({
      totalInCirculation: { totalInCirculationKau, totalInCirculationKag },
      totalFeePool: { backedFeesInPoolKau, backedFeesInPoolKag },
      isLoading: false,
    })
  }

  fetchLatestLedger = async (connection: any) => {
    const response = { totalCoinsKag: 0, totalCoinsKau: 0, kagFeePool: 0, kauFeePool: 0 }
    const ledgersKag = await getLedgers(connection.kag)
    response['totalCoinsKag'] = Number(ledgersKag[0]?.total_coins)
    response['kagFeePool'] = Number(ledgersKag[0]?.fee_pool)
    const ledgersKau = await getLedgers(connection.kau)
    response['totalCoinsKau'] = Number(ledgersKau[0]?.total_coins)
    response['kauFeePool'] = Number(ledgersKau[0]?.fee_pool)
    // const latest = {...ledgersKag[0],...ledgersKau[0]}
    return response
  }

  render() {
    const { totalFeePool, totalInCirculation, isLoading } = this.state
    const {
      selectedConnection: { kau, kag },
    } = this.props
    let currAbbr: string = kau.currency
    let currName: string = kag.currency
    if ((Number(localStorage.getItem('selectedConnection')) === 1)) {
      currAbbr = 'T' + currAbbr
      currName = 'T' + currName
    }
    else{
    // console.log('Mainnet.....')
    }

    return (
      <article className='tile is-child box w-80'>
        <p className='title'>Kinesis in Circulation</p>
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

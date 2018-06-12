import * as React from 'react'
import { AccountRecord, CallFunctionTemplateOptions, CollectionPage, Keypair, LedgerRecord, Network, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { Subscribe } from 'unstated'
import { Connection } from '../../types'
import { flatten, renderAmount, sum } from '../../utils'
import { ConnectionContainer, ConnectionContext, ConnectionContextHandlers } from '../../services/connections'
import { convertStroopsToKinesis, getAccount, getEmissionKeypair, getMasterKeypair, getLedgers, getNetwork } from '../../services/kinesis'
import { HorizontalLabelledField } from '../shared/LabelledField'

interface StatisticsWidgetProps extends ConnectionContext {}
interface State {
  totalFeePool: number,
  totalInCirculation: number,
}

class StatisticsWidget extends React.Component<StatisticsWidgetProps, State> {
  state: State = {
    totalFeePool: 0,
    totalInCirculation: 0,
  }

  componentDidMount() {
    this.loadStatisticsData(this.props.selectedConnection)
  }

  loadStatisticsData = async (connection: Connection): Promise<void> => {
    const creds = this.fetchAccountKeys(connection)

    const [ root, emission ] = await this.fetchAccounts(creds)
    const { totalCoins, feePool } = await this.getLatestLedger(connection)

    const unbackedBalances = this.getUnbackedBalances([ root, emission ])
    const totalInCirculation = totalCoins - unbackedBalances

    const unbackedFees = await this.getUnbackedFees([ root, emission ])
    const totalFeePool = feePool - unbackedFees

    this.setState({ totalInCirculation, totalFeePool })
  }

  fetchAccountKeys = (connection: Connection) => {
    const emissionKeypair = getEmissionKeypair(connection)
    const masterKeypair = getMasterKeypair()

    return {
      emissionId: emissionKeypair.publicKey(),
      rootId: masterKeypair.publicKey(),
    }
  }

  fetchAccounts = async ({ rootId, emissionId }: { rootId: string, emissionId: string }): Promise<AccountRecord[]> => {
    const [ root, emission ] = await Promise.all([
      getAccount(this.props.selectedConnection, rootId),
      getAccount(this.props.selectedConnection, emissionId),
    ])

    return [ root, emission ]
  }

  getLatestLedger = async (connection: Connection): Promise<LedgerRecord & { totalCoins: number, feePool: number }> => {
    const ledgers = await getLedgers(connection)
    const latest = ledgers[0]
    return {
      ...latest,
      totalCoins: Number(latest.total_coins),
      feePool: Number(latest.fee_pool)
    }
  }

  getUnbackedBalances = (accounts: AccountRecord[]): number => {
    const balances = flatten(...accounts.map(account => account.balances))

    return balances.reduce((memo: number, balance) => {
      return balance.asset_type === 'native' ? memo + Number(balance.balance) : memo
    }, 0)
  }

  getUnbackedFees = async ([ root, emission ]: AccountRecord[]): Promise<number> => {
    const hasInflationType = (records: OperationRecord[]): OperationRecord | undefined => records.find(r => r.type === 'inflation')

    const getInflationType = (record: OperationRecord): boolean => record.type === 'inflation'

    const getLatestInflationOperation = async (account: AccountRecord): Promise<OperationRecord | void> => {
      let inflationOperation: OperationRecord | undefined

      const operationQuery: CallFunctionTemplateOptions = { limit: 100, order: 'desc' }
      let operationResults = await account.operations(operationQuery)

      inflationOperation = operationResults.records.find(getInflationType)

      while (!inflationOperation) {
        operationResults = await operationResults.next()
        inflationOperation = hasInflationType(operationResults.records)
      }

      return inflationOperation
    }

    const { paging_token: cursor } = await getLatestInflationOperation(root)

    const getTransactionsForAccount = async (account: AccountRecord, cursor?: string): Promise<TransactionRecord[]> => {
      const { records }: CollectionPage<TransactionRecord> = await account.transactions({ cursor })
      return records
    }

    const transactionRecords = await Promise.all([
      getTransactionsForAccount(emission, cursor),
      getTransactionsForAccount(root, cursor)
    ])

    const uniques = flatten(...transactionRecords).map(t => t.fee_paid)
    const totalFeesInStroops = uniques.reduce(sum, 0)
    const totalFeesKinesis = convertStroopsToKinesis(totalFeesInStroops)
    return totalFeesKinesis
  }

  render() {
    return <Statistics {...this.state} />
  }
}

interface Props {
  totalInCirculation: number,
  totalFeePool: number,
}
const Statistics: React.SFC<Props> = ({ totalFeePool, totalInCirculation }) => {
  return (
    <article className='tile is-child box'>
      <p className='title'>Statistics</p>
      <HorizontalLabelledField label={'Kinesis in Circulation'} wideLabel value={ `KAU ${renderAmount(totalInCirculation)}` } />
      <HorizontalLabelledField label={'Total Fee Pool'} wideLabel value={`KAU ${renderAmount(totalFeePool)}`} />
    </article>
  )
}

export default class ConnectedStatistics extends React.Component {
  render() {
    return (
      <Subscribe to={[ ConnectionContainer ]}>
        {({ state }: ConnectionContainer) => <StatisticsWidget {...state} />}
      </Subscribe>
    )
  }
}

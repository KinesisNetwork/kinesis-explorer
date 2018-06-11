import * as React from 'react'
import { AccountRecord, CallFunctionTemplateOptions, CollectionPage, Keypair, LedgerRecord, Network, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { createHash } from 'crypto'
import { Subscribe } from 'unstated'
import { Connection } from '../../types'
import { flatten, renderAmount, sum } from '../../utils'
import { ConnectionContainer, ConnectionContext, ConnectionContextHandlers } from '../../services/connections'
import { getAccount, getLedgers, getNetwork } from '../../services/kinesis'
import { HorizontalLabelledField } from '../shared/LabelledField'

window.sdk = require('js-kinesis-sdk')

interface StatisticsWidgetProps extends ConnectionContext {}
interface State {
  totalFeePool: number,
  totalInCirculation: number,
}

function log<T>(x: T): T {
  console.log(x)
  return x
}

class StatisticsWidget extends React.Component<StatisticsWidgetProps, State> {
  state: State = {
    totalFeePool: 0,
    totalInCirculation: 0,
  }

  async componentDidMount() {
    /*
      1. get account keys for emission and root accounts
      2. fetch these accounts
      3. (totalFees) fetch operations for root account until we find the most recent inflation operation (type === 'inflation')
        - take paging_token from inflation operation
        - use inflation paging_token to fetch transactions for root account filtered since this timestamp
        - fetch all transactions for emission account
        - sum total fees paid on all these transactions
      4. (totalInCirculation) fetch primary balances from emission and root accounts
        - sum these balances to find total unbacked balances
        - subtract total unbacked balances from total_coins on latest ledger to provide total of backed balances in circulation
      6. provide totalFees and totalInCirculation to Statistics component to render
    */
    const creds = this.fetchAccountKeys(this.props.selectedConnection)

    const [ root, emission ] = await this.fetchAccounts(creds)
    const { totalCoins, feePool } = await this.getLatestLedger(this.props.selectedConnection)

    const totalBalances = this.getUnbackedBalances([ root, emission ])
    const totalInCirculation = totalCoins - totalBalances

    const totalFees = await this.getUnbackedFees([ root, emission ])
    const totalFeePool = feePool - totalFees

    this.setState({ totalInCirculation, totalFeePool })
  }

  fetchAccountKeys = (connection: Connection) => {
    const emissionKeypair = getEmissionKeypair(connection)
    const masterKeypair = getMasterKeypair(connection)

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
    window.root = root
    console.log(root)
    // 3. (totalFees) fetch operations for root account until we find the most recent inflation operation (type === 'inflation')
    //   - take paging_token from inflation operation
    //   - use inflation paging_token to fetch transactions for root account filtered since this timestamp
    //   - fetch all transactions for emission account
    //   - sum total fees paid on all these transactions
    const hasInflationType = (records: OperationRecord[]): OperationRecord | undefined => records.find(r => r.type === 'inflation')

    const getLatestInflationOperation = async (account: AccountRecord): Promise<OperationRecord | void> => {
      let inflationOperation: OperationRecord | undefined

      const operationQuery: CallFunctionTemplateOptions = { limit: 100, order: 'desc' }
      let operationResults = await account.operations(operationQuery)

      inflationOperation = hasInflationType(operationResults.records)

      while (!inflationOperation) {
        operationResults = await operationResults.next()
        inflationOperation = hasInflationType(operationResults.records)
      }

      return inflationOperation
    }

    const latestInflation = await getLatestInflationOperation(root)

    const getTransactionRecords = async (account: AccountRecord, cursor?: string): Promise<TransactionRecord[]> => {
      const { records }: CollectionPage<TransactionRecord> = await account.transactions({ cursor })
      return records
    }

    const transactionRecords = await Promise.all([ getTransactionRecords(emission), getTransactionRecords(root, latestInflation.paging_token) ])
    const uniques = flatten(...transactionRecords).map((t: TransactionRecord) => t.fee_paid)
    return uniques.reduce(sum, 0)
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
    <article className='tile is-child notification'>
      <p className='title'>Statistics</p>
      <p className='subtitle'>Statistics Hi!</p>
      <HorizontalLabelledField label={'Kinesis in Circulation'} wideLabel value={ `KAU ${renderAmount(totalInCirculation)}` } />
      <HorizontalLabelledField label={'Total Fee Pool'} wideLabel value={totalFeePool} />
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

function getEmissionKeypair(connection: Connection): Keypair {
  const currentNetwork = getNetwork(connection)
  const emissionSeedString = `${currentNetwork.networkPassphrase}emission`
  const hash = createHash('sha256')
  hash.update(emissionSeedString)

  return Keypair.fromRawEd25519Seed(hash.digest())
}
function getMasterKeypair(connection: Connection): Keypair {
  return Keypair.master()
}

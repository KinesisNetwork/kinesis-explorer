import axios from 'axios'
import { createHash } from 'crypto'
import {
  AccountRecord,
  CollectionPage,
  InflationOperationRecord,
  Keypair,
  OperationRecord,
  PaymentOperationRecord,
  TransactionRecord,
} from 'js-kinesis-sdk'
import { Connection } from '../types'
import { flatten, sum } from '../utils'
import {
  convertStroopsToKinesis,
  getAccount,
  getNetwork,
  getServer,
} from './kinesis'

export async function getUnbackedBalances(
  connection: Connection,
): Promise<number> {
  const accounts = await fetchUnbackedAccounts(connection)
  return sumNativeBalances(...accounts)
}

function getUnbackedKeysCheck(
  connection: Connection,
): (account: string) => boolean {
  const unbackedKeys = Object.values(getUnbackedAccountKeys(connection))
  return (account: string) => unbackedKeys.includes(account)
}

export async function getKMSCurrencyFees({ currency, stage }: Connection) {
  try {
    if (stage === 'testnet') {
      return 0
    }

    let urlRoot

    switch (process.env.BUCKET) {
      case 'integration-explorer.kinesisgroup.io':
        urlRoot = 'https://integration-api.kinesis.money'
        break
      case 'uat-explorer.kinesisgroup.io':
        urlRoot = 'https://uat-api.kinesis.money'
        break
      case 'explorer.kinesisgroup.io':
        urlRoot = 'https://api.kinesis.money'
        break
      default:
        urlRoot = 'http://localhost:3000'
        break
    }

    const response = await axios
      .get(`${urlRoot}/api/fee-pools/${currency}`)

    return response.data.pool || 0
  } catch (e) {
    // TODO
    return 0
  }
}

async function getBackedFeesFromTransactions(
  ts: CollectionPage<TransactionRecord>,
  connection: Connection,
  accumulatedFee = 0,
): Promise<number> {
  if (ts.records.length === 0) {
    return accumulatedFee
  }

  const isUnbackedTransaction = getUnbackedKeysCheck(connection)
  const transactionFees = await ts.records.reduce(async (acc, curr) => {
    const operations = await curr.operations()
    const payments = operations.records.reduce(
      (ops, nextOp) => (nextOp.type === 'payment' ? ops.concat(nextOp) : ops),
      [] as PaymentOperationRecord[],
    )
    return payments[0]
      ? isUnbackedTransaction(curr.source_account) ||
        isUnbackedTransaction(payments[0].to)
        ? acc
        : (await acc) + curr.fee_paid
      : isUnbackedTransaction(curr.source_account)
        ? acc
        : (await acc) + curr.fee_paid
  }, Promise.resolve(0))

  const currentTotalFees = transactionFees + accumulatedFee

  return ts.records.length < 200
    ? currentTotalFees
    : getBackedFeesFromTransactions(
      await ts.next(),
      connection,
      currentTotalFees,
    )
}

export async function getBackedFees(connection: Connection): Promise<number> {
  const server = getServer(connection)
  try {
    const first200OperationPage = await server
      .operations()
      .limit(200)
      .order('desc')
      .call()

    const inflationOperation = await getInflationOperation(
      first200OperationPage,
      5000,
    )

    if (inflationOperation && inflationOperation.transaction) {
      const { paging_token } = await inflationOperation.transaction()
      const transactions = await server
        .transactions()
        .cursor(paging_token)
        .order('asc')
        .limit(200)
        .call()

      const totalFeesInStroops = await getBackedFeesFromTransactions(
        transactions,
        connection,
      )

      return convertStroopsToKinesis(totalFeesInStroops)
    } else {
      return convertStroopsToKinesis(0)
    }
  } catch (error) {
    return convertStroopsToKinesis(0)
  }
}

async function fetchUnbackedAccounts(
  connection: Connection,
): Promise<AccountRecord[]> {
  const { rootId, emissionId, coldWalletId } = getUnbackedAccountKeys(
    connection,
  )
  const rootAndEmission = await Promise.all([
    getAccount(connection, rootId),
    getAccount(connection, emissionId),
  ])
  try {
    const coldWallet = await getAccount(connection, coldWalletId)
    return rootAndEmission.concat(coldWallet)
  } catch (e) {
    return rootAndEmission
  }
}

function getUnbackedAccountKeys(connection: Connection) {
  const emissionKeypair = getEmissionKeypair(connection)
  const masterKeypair = getMasterKeypair()
  const coldWallet = getColdWalletPublicKey()
  return {
    emissionId: emissionKeypair.publicKey(),
    rootId: masterKeypair.publicKey(),
    coldWalletId: coldWallet,
  }
}

export function getEmissionKeypair(connection: Connection): Keypair {
  const currentNetwork = getNetwork(connection)
  const emissionSeedString = `${currentNetwork.networkPassphrase()}emission`
  const hash = createHash('sha256')
  hash.update(emissionSeedString)
  return Keypair.fromRawEd25519Seed(hash.digest())
}

export function getColdWalletPublicKey(): string {
  return 'GAPS3KZ4YVEL4UYFAGTE6L6H6GRZ3KYBWGY2UTGTAJBXGUJLBCYQIXXA'
}

export function getMasterKeypair(): Keypair {
  return Keypair.master()
}

function isInflation(op: OperationRecord): op is InflationOperationRecord {
  return op.type === 'inflation'
}

function findInflationOperation(operations: CollectionPage<OperationRecord>) {
  return operations.records.find(isInflation)
}

async function getInflationOperation(
  operationsPage: CollectionPage<OperationRecord>,
  ms: number = 5000,
): Promise<OperationRecord | void> {
  let result: OperationRecord | undefined
  let op = operationsPage
  let timeout = false

  const timer = setTimeout(() => {
    timeout = true
  }, ms)

  result = findInflationOperation(op)
  while (!result && !timeout) {
    op = await op.next()
    result = findInflationOperation(op)
  }
  clearTimeout(timer)
  if (timeout) {
    throw new Error(`getInflationOperation timed out in ${ms} ms.`)
  }
  return result
}

function sumNativeBalances(...accounts: AccountRecord[]): number {
  const balances = flatten(
    ...accounts.map((acc) => acc.balances.filter(hasNativeAssetType)),
  )

  return balances.reduce((memo, { balance }) => sum(memo, Number(balance)), 0)
}

function hasNativeAssetType<T extends { asset_type: string }>(
  balance: T,
): boolean {
  return balance.asset_type === 'native'
}

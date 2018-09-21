import { createHash } from 'crypto'
import {
  AccountRecord,
  CollectionPage,
  InflationOperationRecord,
  Keypair,
  OperationRecord,
  Server,
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

async function getBackedFeesFromTransactions(
  ts: CollectionPage<TransactionRecord>,
  connection: Connection,
  accumulatedFee = 0,
): Promise<number> {
  if (ts.records.length === 0) {
    return accumulatedFee
  }

  const isUnbackedTransaction = getUnbackedKeysCheck(connection)
  const transactionFees = ts.records.reduce(
    (acc, curr) =>
      isUnbackedTransaction(curr.source_account) ? acc : acc + curr.fee_paid,
    0,
  )

  const currentTotalFees = transactionFees + accumulatedFee
  // Transactions is
  return ts.records.length < 200
    ? currentTotalFees
    : getBackedFeesFromTransactions(
        await ts.next(),
        connection,
        transactionFees + accumulatedFee,
      )
}

export async function getBackedFees(connection: Connection): Promise<number> {
  const server = getServer(connection)

  const inflationOperation = await getInflationOperation(
    await server
      .operations()
      .limit(200)
      .order('desc')
      .call(),
  )
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
}

async function fetchUnbackedAccounts(
  connection: Connection,
): Promise<AccountRecord[]> {
  const { rootId, emissionId } = getUnbackedAccountKeys(connection)
  return Promise.all([
    getAccount(connection, rootId),
    getAccount(connection, emissionId),
  ])
}

function getUnbackedAccountKeys(connection: Connection) {
  const emissionKeypair = getEmissionKeypair(connection)
  const masterKeypair = getMasterKeypair()

  return {
    emissionId: emissionKeypair.publicKey(),
    rootId: masterKeypair.publicKey(),
  }
}

export function getEmissionKeypair(connection: Connection): Keypair {
  const currentNetwork = getNetwork(connection)
  const emissionSeedString = `${currentNetwork.networkPassphrase()}emission`
  const hash = createHash('sha256')
  hash.update(emissionSeedString)

  return Keypair.fromRawEd25519Seed(hash.digest())
}

export function getMasterKeypair(): Keypair {
  return Keypair.master()
}

function isInflation(op: OperationRecord): op is InflationOperationRecord {
  return op.type === 'inflation'
}

async function getInflationOperation(
  operations: CollectionPage<OperationRecord>,
): Promise<InflationOperationRecord> {
  return (
    operations.records.find(isInflation) ||
    getInflationOperation(await operations.next())
  )
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

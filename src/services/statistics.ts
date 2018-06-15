import { createHash } from 'crypto'
import {
  AccountRecord,
  CallFunctionTemplateOptions,
  CollectionPage,
  Keypair,
  OperationRecord,
  TransactionRecord,
} from 'js-kinesis-sdk'
import { Connection } from '../types'
import { flatten, sum } from '../utils'
import {
  convertStroopsToKinesis,
  getAccount,
  getNetwork,
} from './kinesis'

export async function getUnbackedBalances(connection: Connection): Promise<number> {
  const accounts = await fetchUnbackedAccounts(connection)
  return sumNativeBalances(...accounts)
}

export async function getUnbackedFees(connection: Connection): Promise<number> {
  const [root, emission] = await fetchUnbackedAccounts(connection)
  const { paging_token: cursor } = await getLatestInflationOperation(root)

  const transactionRecords = await Promise.all([
    getTransactionsForAccount(emission, cursor),
    getTransactionsForAccount(root, cursor),
  ])

  const uniques = flatten(...transactionRecords).map((t) => t.fee_paid)
  const totalFeesInStroops = uniques.reduce(sum, 0)
  const totalFeesKinesis = convertStroopsToKinesis(totalFeesInStroops)
  return totalFeesKinesis
}

async function fetchUnbackedAccounts(connection: Connection): Promise<AccountRecord[]> {
  const { rootId, emissionId } = getUnbackedAccountKeys(connection)
  const [root, emission] = await Promise.all([
    getAccount(connection, rootId),
    getAccount(connection, emissionId),
  ])

  return [root, emission]
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

async function getLatestInflationOperation(account: AccountRecord): Promise<OperationRecord> {
  const operationQuery: CallFunctionTemplateOptions = { limit: 100, order: 'desc' }

  let accountOperations = await account.operations(operationQuery)

  let inflationOperation = getInflationType(accountOperations.records)

  while (!inflationOperation) {
    accountOperations = await accountOperations.next()
    inflationOperation = getInflationType(accountOperations.records)
  }

  return inflationOperation
}

async function getTransactionsForAccount(account: AccountRecord, cursor?: string): Promise<TransactionRecord[]> {
  const { records } = await account.transactions({ cursor })
  return records
}

function sumNativeBalances(...accounts: AccountRecord[]): number {
  const balances = flatten(
    ...accounts.map((acc) => acc.balances.filter(hasNativeAssetType)),
  )

  return balances.reduce((memo, { balance }) => sum(memo, Number(balance)), 0)
}

function hasNativeAssetType<T extends { asset_type: string }>(balance: T): boolean {
  return balance.asset_type === 'native'
}

function hasInflationType(record: OperationRecord): boolean {
  return record.type === 'inflation'
}

function getInflationType(records: OperationRecord[]): OperationRecord | undefined {
  return records.find(hasInflationType)
}

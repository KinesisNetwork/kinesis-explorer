import axios from 'axios'
import BigNumber from 'bignumber.js'
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
import { convertStroopsToKinesis, getAccount, getNetwork, getServer } from './kinesis'

interface KemFee extends TransactionRecord {
  fee_charged?: string | number
}

export async function getUnbackedBalances(connection: Connection): Promise<string> {
  const accounts = await fetchUnbackedAccounts(connection)
  return sumNativeBalances(...accounts)
}

function getUnbackedKeysCheck(connection: Connection): (account: string) => boolean {
  const unbackedKeys = Object.values(getUnbackedAccountKeys(connection))
  return (account: string) => unbackedKeys.includes(account)
}

async function getBackedFeesFromTransactions(
  ts: CollectionPage<KemFee>,
  connection: Connection,
  accumulatedFee = 0,
): Promise<number> {
  if (ts.records.length === 0) {
    return accumulatedFee
  }
  const isUnbackedTransaction = getUnbackedKeysCheck(connection)

  const transactionFees = ts.records.reduce(
    (acc, curr) =>
      isUnbackedTransaction(curr.source_account) ? acc : acc + (curr.fee_paid || Number(curr.fee_charged)),
    0,
  )

  const currentTotalFees = transactionFees + accumulatedFee

  return ts.records.length < 200
    ? currentTotalFees
    : getBackedFeesFromTransactions(await ts.next(), connection, currentTotalFees)
}

export async function getBackedFees(connection: any): Promise<number> {

  const server = getServer(connection.networkPassphrase,connection.horizonURL)
  try {
    const first200OperationPage = await server.operations().limit(200).order('desc').call()

    const inflationOperation = await getInflationOperation(first200OperationPage, 5000)

    if (inflationOperation && inflationOperation.transaction) {
      const { paging_token } = await inflationOperation.transaction()
      const transactions = await server.transactions().cursor(paging_token).order('asc').limit(200).call()

      const totalFeesInStroops = await getBackedFeesFromTransactions(transactions, connection)
      return convertStroopsToKinesis(totalFeesInStroops)

    } else {
      return convertStroopsToKinesis(0)
    }
  } catch (error) {
    return convertStroopsToKinesis(0)
  }
}

async function fetchUnbackedAccounts(connection: Connection): Promise<AccountRecord[]> {
  const { rootId, emissionId } = getUnbackedAccountKeys(connection)
  return Promise.all([getAccount(connection, rootId), getAccount(connection, emissionId)])
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

function sumNativeBalances(...accounts: AccountRecord[]): string {
  let balancesArray = []
  const balances = flatten(...accounts.map((acc) => acc.balances.filter(hasNativeAssetType)))
  balancesArray = balances.map((e) => e.balance)
  const bigNum = new BigNumber(balancesArray[0])
  return bigNum.plus(balancesArray[1]).toFixed(7)
  // return balances.reduce((memo, { balance }) => sum(memo, Number(balance)), 0)
}

function hasNativeAssetType<T extends { asset_type: string }>(balance: T): boolean {
  return balance.asset_type === 'native'
}

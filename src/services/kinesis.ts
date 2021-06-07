import {
  AccountRecord,
  CollectionPage,
  LedgerCallBuilder,
  LedgerRecord,
  Network,
  OperationRecord,
  Server,
  StrKey,
  TransactionCallBuilder,
  TransactionRecord,
} from 'js-kinesis-sdk'
import { Connection } from '../types'

const STROOPS_IN_ONE_KINESIS = 1e7

export function convertStroopsToKinesis(numberInStroops: number): number {
  return numberInStroops / STROOPS_IN_ONE_KINESIS
}

export function getNetwork(connection: Connection): Network {
  Network.use(new Network(connection.networkPassphrase))
  return Network.current()
}

export function getServer(connection: Connection): Server {
  Network.use(new Network(connection.networkPassphrase))
  return new Server(connection.horizonURL)
}

export async function getTransaction(connection: Connection, transactionId: string) {
  const server = getServer(connection)
  return await server.transactions().transaction(transactionId).call()
}

export async function getTransactions(
  connection: Connection,
  accountId?: string,
  limit = 10,
  cursor?: string,
): Promise<TransactionRecord[]> {
  const server = getServer(connection)
  const transactionsPromise = server.transactions()

  if (accountId) {
    transactionsPromise.forAccount(accountId)
  }

  if (cursor) {
    transactionsPromise.cursor(cursor)
  }

  const { records }: CollectionPage<TransactionRecord> = await transactionsPromise.limit(limit).order('desc').call()

  return records
}

export async function getTransactionStream(
  connection: Connection,
  cursor = 'now',
  limit = 1,
): Promise<TransactionCallBuilder> {
  const server = getServer(connection)
  return await server.transactions().cursor(cursor).limit(limit)
}

export async function getLedger(connection: Connection, sequence: number | string): Promise<LedgerRecord> {
  const server = getServer(connection)
  const ledger = (await (server.ledgers() as any).ledger(sequence).call()) as LedgerRecord
  return ledger
}
export async function getAccountMergeAmountfromResultxdr(connection: Connection, result_xdr: number | string): Promise<TransactionRecord> {

  const server = getServer(connection)
  const transaction = (await (server.transactions() as any).transactions(result_xdr).call()) as TransactionRecord
  return transaction

}

export async function getLedgers(connection: Connection, limitVal: number = 10): Promise<LedgerRecord[]> {
  const server = getServer(connection)
  const { records }: CollectionPage<LedgerRecord> = await server.ledgers().limit(limitVal).order('desc').call()
  return records
}

export async function getLedgerStream(connection: Connection, cursor = 'now'): Promise<LedgerCallBuilder> {
  const server = getServer(connection)
  return server.ledgers().cursor(cursor).limit(1)
}

export async function getAccount(connection: Connection, accountId: string): Promise<AccountRecord> {
  const server = getServer(connection)
  const account: AccountRecord = await server.loadAccount(accountId)
  return account
}

export async function validateAccount(address: string): Promise<boolean> {
  return StrKey.isValidEd25519PublicKey(address)
}

export async function getOperations(
  connection: Connection,
  limit = 10,
  _cursor?: string,
): Promise<OperationRecord[]> {
  const server = getServer(connection)
  const transactionsPromise = server.operations()
  const { records }: CollectionPage<OperationRecord> = await transactionsPromise.limit(limit).order('desc').call()

  return records
}

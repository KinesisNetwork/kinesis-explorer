import {
  AccountRecord,
  CollectionPage,
  LedgerCallBuilder,
  LedgerRecord,
  Network,
  Server,
  TransactionCallBuilder,
  TransactionRecord,
} from 'js-kinesis-sdk'
import { Connection } from '../types'

export function getServer(connection: Connection): Server {
  Network.use(new Network(connection.networkPassphrase))
  return new Server(connection.horizonURL)
}

export async function getTransactions(connection: Connection): Promise<TransactionRecord[]> {
  const server = getServer(connection)
  const { records }: CollectionPage<TransactionRecord> = await server.transactions().limit(10).order('desc').call()
  return records
}

export async function getTransactionStream(connection: Connection, cursor = 'now'): Promise<TransactionCallBuilder> {
  const server = getServer(connection)
  return await server.transactions().cursor(cursor)
}

export async function getTransaction(connection: Connection, transactionId: string) {
  const server = getServer(connection)
  return await server.transactions().transaction(transactionId).call()
}

export async function getLedgers(connection: Connection): Promise<LedgerRecord[]> {
  const server = getServer(connection)
  const { records }: CollectionPage<LedgerRecord> = await server.ledgers().limit(10).order('desc').call()
  return records
}

export async function getLedgerStream(connection: Connection, cursor = 'now'): Promise<LedgerCallBuilder> {
  const server = getServer(connection)
  return server.ledgers().cursor(cursor)
}

export async function getAccount(connection: Connection, accountId: string) {
  const server = getServer(connection)
  const account: AccountRecord = await server.accounts().accountId(accountId).call() as any
  return account
}

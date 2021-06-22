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
import moment from 'moment'
import { Connection } from '../types'

const STROOPS_IN_ONE_KINESIS = 1e7

export function convertStroopsToKinesis(numberInStroops: number): number {
  return numberInStroops / STROOPS_IN_ONE_KINESIS
}

export function getNetwork(connection: Connection): Network {
  Network.use(new Network(connection.kau.networkPassphrase))
  // Network.use(new Network(connection.kag.networkPassphrase ))
  return Network.current()
}

export function getServer(connection: Connection): Server {
  Network.use(new Network(connection.kau.networkPassphrase))
  // Network.use(new Network(connection.kag.networkPassphrase))
  return new Server(connection.kau.horizonURL)
}

export function getServerKag(connection, horizonUrl): Server {
  Network.use(new Network(connection))
  return new Server(horizonUrl)
}

export function getServerKau(connection, horizonUrl): Server {
  Network.use(new Network(connection))
  return new Server(horizonUrl)
}

export async function getTransaction(connection: Connection, transactionId: string) {
  let server
  // console.log('Get transaction')

  try {
    const serversKag = getServerKag(connection.kag.networkPassphrase, connection.kag.horizonURL)
    server = await serversKag.transactions().transaction(transactionId).call()
    // console.log('Server 1', server)
  } catch (error) {
    try {
      const serversKau = getServerKau(connection.kau.networkPassphrase, connection.kau.horizonURL)
      server = await serversKau.transactions().transaction(transactionId).call()
    } catch (error) {
      // console.log('error', error)
    }
  }

  return server
}

export async function getTransactions(
  connection: Connection,
  accountId?: string,
  limit = 10,
  cursor?: string,
): Promise<TransactionRecord[]> {
  const serverKag = getServerKag(connection.kag.networkPassphrase, connection.kag.horizonURL)
  const serverKau = getServerKau(connection.kau.networkPassphrase, connection.kau.horizonURL)

  const transactionsPromise = { kag: serverKag.transactions(), kau: serverKau.transactions() }

  if (accountId) {
    transactionsPromise.kag.forAccount(accountId)
    transactionsPromise.kau.forAccount(accountId)
  }

  if (cursor) {
    transactionsPromise.kag.cursor(cursor)
    transactionsPromise.kau.cursor(cursor)
  }
  let records
  const recordsKau = await getRecords(transactionsPromise.kau, limit)
  const recordsKag = await getRecords(transactionsPromise.kag, limit)
  records = [...recordsKau, ...recordsKag]
  // console.log('getTransactionsRecords', records)
  // return records.length > 0
  //   ? records.sort((recordA, recordB) => {
  //       return moment(recordA.created_at).valueOf() - moment(recordB.created_at).valueOf()
  //     })
  //   : []
  return records
}

export async function getRecords(transactionsPromise, limit) {
  const { records }: CollectionPage<TransactionRecord> = await transactionsPromise.limit(limit).order('desc').call()
  // console.log('Records', records, limit)
  // return records.length > 0
  //   ? records.sort((recordA, recordB) => {
  //       return moment(recordA.created_at).valueOf() - moment(recordB.created_at).valueOf()
  //     })
  //   : []
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

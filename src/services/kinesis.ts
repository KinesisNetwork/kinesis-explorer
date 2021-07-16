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
export function getNewNetwork(connection: any): Network {
  Network.use(new Network(connection.networkPassphrase))
  // Network.use(new Network(connection.kag.networkPassphrase ))
  return Network.current()
}
export function getNetwork(connection: Connection): Network {
  Network.use(new Network(connection.kau.networkPassphrase))
  // Network.use(new Network(connection.kag.networkPassphrase ))
  return Network.current()
}

export function getServer(networkPassphrase, horizonUrl): Server {
  Network.use(new Network(networkPassphrase))
  // Network.use(new Network(connection.kag.networkPassphrase))
  return new Server(horizonUrl)
}
// export function getServerKag(connection, horizonUrl): Server {
//   Network.use(new Network(connection))
//   return new Server(horizonUrl)
// }

// export function getServerKau(connection, horizonUrl): Server {
//   Network.use(new Network(connection))
//   return new Server(horizonUrl)
// }

export async function getTransaction(connection: Connection, transactionId: string) {
  let server
  // console.log('Get transaction')
  try {
    const serversKag = getServer(connection.kag.networkPassphrase, connection.kag.horizonURL)
    server = await serversKag.transactions().transaction(transactionId).call()
    // console.log('Server 1', server)
  } catch (error) {
    try {
      const serversKau = getServer(connection.kau.networkPassphrase, connection.kau.horizonURL)
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
  const serverKag = getServer(connection.kag.networkPassphrase, connection.kag.horizonURL)
  const serverKau = getServer(connection.kau.networkPassphrase, connection.kau.horizonURL)

  const transactionsPromise = { kag: serverKag.transactions(), kau: serverKau.transactions() }

  if (accountId) {
    transactionsPromise.kag.forAccount(accountId)
    transactionsPromise.kau.forAccount(accountId)
  }

  if (cursor) {
    transactionsPromise.kag.cursor(cursor)
    transactionsPromise.kau.cursor(cursor)
  }
  // let records
  // const recordsKau = await getRecords(transactionsPromise.kau, limit)
  // console.log(recordsKau, 'recordkau')
  // const recordsKag = await getRecords(transactionsPromise.kag, limit)
  // console.log(recordsKag, 'recordkag')
  // records = [...recordsKau , ...recordsKag]
  // console.log(records, 'records')
  const recordsKau = new Promise((resolve, reject) => {
    resolve(getRecords(transactionsPromise.kau, limit))
  })
  const recordsKag = new Promise((resolve, reject) => {
    resolve(getRecords(transactionsPromise.kag, limit))
  })
  const outputKau = Promise.all([recordsKau])
    .then((res) => {
      return res[0]
    })
    .catch((err) => {
      return []
    })
  const outputKag = Promise.all([recordsKag])
    .then((res) => {
      return res[0]
    })
    .catch((err) => {
      return []
    })
  const Kau: any = await outputKau.then((result) => result)
  // console.log('output', Kau)
  let records
  const Kag: any = await outputKag.then((result) => result)
  // const recordsKag = await getRecords(transactionsPromise.kag, limit)
  records = [...Kau, ...Kag]
  // records.sort(function(a,b){
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.

  // });
  records.sort((a, b) =>
    moment(a.created_at).valueOf() < moment(b.created_at).valueOf()
      ? 1
      : moment(b.created_at).valueOf() < moment(a.created_at).valueOf()
      ? -1
      : 0,
  )
  // records.sort((a, b) =>
  //   moment(b.created_at).utc().format('hhmmss') > moment(a.created_at).utc().format('hhmmss')
  //     ? 1
  //     : moment(a.created_at).utc().format('hhmmss') > moment(b.created_at).utc().format('hhmmss')
  //     ? -1
  //     : 0,
  // )
  // for (let index = 0; index < records.length; index++) {
  //   const element = records[index].created_at
  //   console.log(moment(records[index]?.created_at).utc().format("hh"), 'value', records[index]?.created_at)
  // }
  return records
  // console.log('getTransactionsRecords', records)
  // return records.length > 0
  //   ? records.sort((recordA, recordB) => {
  //       return moment(recordA.created_at).valueOf() - moment(recordB.created_at).valueOf()
  //     })
  //   : []
  // return records
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
  connection: any,
  cursor = 'now',
  limit = 0,
): Promise<TransactionCallBuilder> {
  const server = getServer(connection.networkPassphrase, connection.horizonURL)
  // console.log('connection.pass', connection.networkPassphrase)

  return await server.transactions().cursor(cursor).limit(limit)
}

export async function getLedger(connection: any, sequence: number | string): Promise<LedgerRecord> {
  const serverKag = getServer(connection.kag.networkPassphrase, connection.kag.horizonURL)
  const serverKau = getServer(connection.kau.networkPassphrase, connection.kau.horizonURL)
  // const ledger = (await (server.ledgers() as any).ledger(sequence).call()) as LedgerRecord
  // return ledger
  let ledger
  try {
    ledger = (await (serverKau.ledgers() as any).ledger(sequence).call()) as LedgerRecord
  } catch (error) {
    try {
      ledger = (await (serverKag.ledgers() as any).ledger(sequence).call()) as LedgerRecord
    } catch (error) {
      // console.log(error)
    }
  }
  return ledger
}
export async function getLedgers(connection: any, limitVal: number = 10): Promise<LedgerRecord[]> {
  const server = getServer(connection.networkPassphrase, connection.horizonURL)
  const { records }: CollectionPage<LedgerRecord> = await server.ledgers().limit(limitVal).order('desc').call()
  return records
}

export async function getLedgerStream(connection: any, cursor = 'now'): Promise<LedgerCallBuilder> {
  const server = getServer(connection.networkPassphrase, connection.horizonURL)
  return server.ledgers().cursor(cursor).limit(1)
}

export async function getAccount(connection: any, accountId: string): Promise<AccountRecord> {
  const serv: AccountRecord = undefined
  try {
    const servers = getServer(connection.networkPassphrase, connection.horizonURL)
    return await servers.loadAccount(accountId)
  } catch (error) {
    return serv
  }
}

export async function validateAccount(address: string): Promise<boolean> {
  return StrKey.isValidEd25519PublicKey(address)
}

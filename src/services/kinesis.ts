import { Network, Server, Transaction, TransactionRecord } from 'js-kinesis-sdk'
import { Connection, TransactionOperationView } from '../types'
import { flatten } from '../utils'

const STROOPS_IN_ONE_KINESIS = 10000000

export function getServer(connection: Connection): Server {
  Network.use(new Network(connection.networkPassphrase))
  return new Server(connection.horizonURL)
}

const operationTypes = {
  createAccount: {
    label: 'Create Account',
    amount: 'startingBalance',
  },
  payment: {
    label: 'Payment',
    amount: 'amount',
  }
}

function getOperationLabel(operation: any): string {
  return operationTypes[operation.type].label
}

function getOperationAmount(operation: any): string {
  return operation[operationTypes[operation.type].amount]
}

function formatTransaction(transactionRecord: TransactionRecord) {
  const { operations, signatures }: any = new Transaction(transactionRecord.envelope_xdr)
  return {
    ...transactionRecord,
    operations,
    signatures,
    label: getOperationLabel(operations[0]),
    amount: getOperationAmount(operations[0]),
    source: transactionRecord.source_account
  }
}

export async function getTransactionStream({ handleStreamData, handleLoadData, server }: any){
  try {
    const { records }: any = await server.transactions().cursor().limit(10).order('desc').call()
    const initialTransactions: any = records.map((record: any) => {
      const { operations, signatures }: any = new Transaction(record.envelope_xdr)
      return formatTransaction(record)
    })

    handleLoadData(initialTransactions)
    const transactionStream = await server.transactions().order('asc').cursor(initialTransactions.length ? records[0].paging_token : 'now')

    return transactionStream.stream({ onmessage: function(record: any) {
      const formattedRecord = formatTransaction(record)
      return handleStreamData(formattedRecord)
    }})
  } catch(err){
    console.error(err)
  }
}

export async function getFeeInStroops(
  server: Server,
  amountInKinesis: number,
): Promise<string> {
  const mostRecentLedger = await server.ledgers().order('desc').call()
  const {
    base_percentage_fee: basePercentageFee,
    base_fee_in_stroops: baseFeeInStroops,
  } = mostRecentLedger.records[0]
  const basisPointsToPercent = 10000

  const percentageFee = Number(amountInKinesis) * basePercentageFee / basisPointsToPercent * STROOPS_IN_ONE_KINESIS

  return String(percentageFee + baseFeeInStroops)
}

export async function getFeeInKinesis(
  connection: Connection,
  amountInKinesis: number,
): Promise<string> {
  const feeInStroops = await getFeeInStroops(getServer(connection), amountInKinesis)
  return String(Number(feeInStroops) / STROOPS_IN_ONE_KINESIS)
}

export async function getTransactions(
  connection: Connection,
  accountKey: string,
): Promise<TransactionOperationView[]> {
  const server = getServer(connection)
  try {
    const transactionPage = await server.transactions().forAccount(accountKey).order('desc').call()
    const nestedArray = await Promise.all(transactionPage.records.map((t) => transactionWithOperations(t, accountKey)))
    return flatten(nestedArray)
  } catch (e) {
    return []
  }
}

async function transactionWithOperations(
  transaction: TransactionRecord,
  accountKey: string,
): Promise<TransactionOperationView[]> {
  const operationsPage = await transaction.operations()
  return operationsPage.records.map((operation): TransactionOperationView => ({
    operation,
    date: new Date(transaction.created_at),
    fee: (Number(transaction.fee_paid) / STROOPS_IN_ONE_KINESIS).toFixed(5) ,
    isIncoming: transaction.source_account === accountKey,
    memo: transaction.memo,
    source: transaction.source_account,
  }))
}

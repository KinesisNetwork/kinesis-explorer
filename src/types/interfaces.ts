import { OperationRecord, TransactionRecord } from 'js-kinesis-sdk'

export interface Connection {
  horizonURL: string
  name: string
  networkPassphrase: string
}

export interface TransactionOperationView {
  readonly source: string
  readonly isIncoming: boolean
  readonly fee: string
  readonly memo: string
  readonly operation: OperationRecord
  readonly date: Date
}

export interface TransactionListItem {
  readonly amount: string
  readonly created_at: string
  readonly id: string
  readonly label: string
  readonly operations: OperationRecord[]
  readonly signatures: any[]
  readonly source: string
}

export interface LedgerListItem {
  readonly closed_at: string
  readonly id: string
  readonly operation_count: number
  readonly operations?: (() => Promise<OperationRecord[]>)
  readonly sequence: any[]
  readonly transaction_count: number
  readonly transactions?: (() => Promise<TransactionRecord[]>)
}

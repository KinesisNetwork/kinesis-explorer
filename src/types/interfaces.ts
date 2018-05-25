import { OperationRecord } from 'js-kinesis-sdk'

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

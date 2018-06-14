import { CallCollectionFunction, TransactionRecord } from "js-kinesis-sdk";

declare module "js-kinesis-sdk" {
  interface AccountRecord {
    transactions: CallCollectionFunction<TransactionRecord>
  }

  interface AccountResponse extends AccountRecord { }
}
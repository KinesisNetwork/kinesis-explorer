import * as React from 'react'

import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { OperationInfo } from './OperationInfo'

interface Props {
  selectedConnection: any,
  operations: CollectionPage<OperationRecord> | null,
  conn?: string
}

export class OperationList extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  // inflationOperation = async (operations) => {
  //   console.log("Operation",operations);

  //   for (let index = 0; index < operations.length; index++) {
  //     let operation = operations[index]
  //     if (operation?.type === 'account_merge') {
  //       const AmountMergeAddressNetwork = operation?._links.effects?.href
  //       const response = await fetch(`${AmountMergeAddressNetwork}?order=desc`, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Accept: 'application/json',
  //         },
  //       })
  //       const url = await response.json()
  //       const getAccountMergeAmount = url?._embedded?.records[2]?.amount
  //       // console.log('getAccountMergeAmount', getAccountMergeAmount)
  //       operation['amount'] = getAccountMergeAmount.toFixed(5)
  //       // return getAccountMergeAmount.toString()
  //     }
  //   }
  //   this.setState({operations})
  // }

  render() {
    // const operations = this.props.operations
    // const operations = this.inflationOperation(this.props.operations)
    // let operations = this.state.operations
    // console.log('this.state.operations', operations)
    const operations = this.props.operations
    const conn = (this.props.selectedConnection === undefined ? 'KAU' : this.props.conn)
    // console.log('Conn', this.props.selectedConnection, this.props)

    return (
      <React.Fragment>
        {operations && operations.records && operations.records.length
          ? operations.records.map((operation, i) => (
              <OperationInfo
                key={i}
                operation={operation}
                conn={conn}
                selectedConnection={this.props.selectedConnection}
              />
            ))
          : null}
      </React.Fragment>
    )
  }
}

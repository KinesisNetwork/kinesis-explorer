import { Server } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'

interface Props {
  networkUrl?: string
  translimit: number
}

class OperationsTable extends React.Component<Props> {
  server = new Server(this.props?.networkUrl)
  state = {
    operations: [],
  }

  componentDidMount() {
    this.getOperations()
  }
  // componentDidUpdate() {
  //   this.getOperations()
  // }

  async getOperations() {
    const operationRecord = await this.server.operations().limit(this.props.translimit).order('desc').call()
    this.setState({ operations: operationRecord.records }, () => {
      this.server
        .operations()
        .cursor('now')
        .limit(1)
        .stream({
          onmessage: (nextData) => {
            this.setState({
              operations: [nextData, ...this.state.operations.slice(0, 9)],
            })
          },
        })
    })
  }

  render() {
    const operationType = this.state.operations[0]?.type

    if (operationType === 'account_merge') {
      const ACCOUNT_MERGE = 'Account Merge'
      return ACCOUNT_MERGE
    }

    if (operationType === 'create_account') {
      const CREATE_ACCOUNT = 'Create Account'
      return CREATE_ACCOUNT
    }
    if (operationType === 'payment') {
      const PAYMENT = 'Payment'
      return PAYMENT
    }
    return (
     <>
     <div>
        <p> {operationType} </p>
      </div>
     </>
    )
  }
}
export default OperationsTable

import { Server } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { renderAmount, renderRelativeDate } from '../../utils'
import { Transactions } from '../widgets'
import OperationsTable from './OperationsTable'
import OperationsTableAmount from './OperationsTableAmount'

interface OperationProps {
  networkUrl?: string
  translimit: number
}

class OperationValue extends React.Component <OperationProps> {
  server = new Server(this.props?.networkUrl)
  state = {
    operations: [],
    // transactions:[]
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
    let destinationAccount
    if (operationType === 'account_merge') {
      destinationAccount = this.state.operations[0]?.into
    }
    if (operationType === 'create_account') {
      destinationAccount = this.state.operations[0]?.account
    }
    if (operationType === 'payment') {
      destinationAccount = this.state.operations[0]?.to
    }
   
    return (
      <>
      <div>
        {/* <Transactions
        transactions={this.state.transactions}
        operations={this.state.operations}/> */}
        <p>
          {' '}
          <Link to={`/account/${destinationAccount}`}>
            {destinationAccount && destinationAccount.length && destinationAccount.slice(0, 4)}......
            {destinationAccount &&
              destinationAccount.length &&
              destinationAccount.substr(destinationAccount.length - 4)}{' '}
          </Link>
        </p>
      </div>

      </>
    )
  }
}
export default OperationValue

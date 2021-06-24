import { Server } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { renderAmount, renderRelativeDate } from '../../utils'
import { Transactions } from '../widgets'
// import OperationsTable from './OperationsTable'
// import OperationsTableAmount from './OperationsTableAmount'

interface OperationProps {
  networkUrl?: string
  translimit: number
  conn?: string
}

class OperationValue extends React.Component<OperationProps> {
  server = new Server(this.props?.networkUrl)
  state = {
    operations: [],
    count: 0,
  }

  componentDidMount() {
    this.getOperations()
  }
  // componentDidUpdate() {
  //   this.getOperations()
  // }

  async getOperations() {
    const operationRecord = await this.server.operations().limit(this.props.translimit).order('desc').call()
    this.setState({ operations: operationRecord.records })
    // this.setState({ operations: operationRecord.records },
    //    () => {
    //   this.server
    //     .operations()
    //     .cursor('now')
    //     .limit(1)
    //     .stream({
    //       onmessage: (nextData) => {
    //         this.setState({
    //           operations: [nextData, ...this.state.operations.slice(0, 9)],
    //         })
    //       },
    //     })
    // })
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
    // if (operationType === 'inflation') {
    //   const INFLATION = 'Inflation'
    //   return INFLATION
    // }
    let operationAmount

    if (operationType === 'account_merge') {
      operationAmount = this.state.operations[0]?.starting_balance
    }
    if (operationType === 'create_account') {
      operationAmount = this.state.operations[0]?.starting_balance
    }
    if (operationType === 'payment') {
      operationAmount = this.state.operations[0]?.amount
    }
    operationAmount = operationAmount && parseFloat(operationAmount).toFixed(5)

    const splitArray = operationType?.split('_')
    let typeOfOperation = ''
    if (splitArray) {
      if (splitArray?.length > 1) {
        for (const splitArrays of splitArray) {
          typeOfOperation += splitArrays?.charAt(0).toUpperCase() + splitArrays?.substr(1).toLowerCase() + ' '
        }
      } else {
        typeOfOperation = splitArray[0]?.charAt(0).toUpperCase() + splitArray[0]?.substr(1).toLowerCase()
      }
    }
    return (
      <>
        {destinationAccount && destinationAccount.length > 0 ? (
          <td className='td'>
            <p>
              {' '}
              <Link to={`/account/${destinationAccount}`}>
                {destinationAccount && destinationAccount.length && destinationAccount.slice(0, 4)}......
                {destinationAccount &&
                  destinationAccount.length &&
                  destinationAccount.substr(destinationAccount.length - 4)}{' '}
              </Link>
            </p>
          </td>
        ) : (
          <td className='td'>.....</td>
        )}
        {typeOfOperation ? (
          <td className='td'>
            <p>{typeOfOperation}</p>
          </td>
        ) : (
          <td className='td'>.....</td>
        )}
        {operationAmount ? (
          <td className='td'>
            <p>
              {operationAmount} {this.props.conn}
            </p>
          </td>
        ) : (
          <td className='td'>{this.props.conn}</td>
        )}
      </>
    )
  }
}
export default OperationValue

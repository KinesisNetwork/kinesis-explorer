import { Server } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { renderAmount, renderRelativeDate } from '../../utils'

class OperationValue extends React.Component {
  constructor(props: any) {
    super(props)
    {
    }
  }

  server = new Server(this.props?.networkUrl)
  state = {
    operations: [],
    name: 'Nitish',
  }

  componentDidMount() {
    this.getOperations()
  }
  componentDidUpdate() {
    this.getOperations()
  }

  async getOperations() {
    const operationRecord = await this.server.operations().limit(this.props.translimit).order('desc').call()
    this.setState({ operations: operationRecord.records }, () => {
      this.server
        .operations()
        .cursor('now')
        .limit(1)
        .stream({
          onmessage: (nextData) => {
            console.warn('New Data Recieved!!', nextData.transaction_hash)
            this.setState({
              operations: [nextData, ...this.state.operations.slice(0, 9)],
            })
          },
        })
    })
  }

  render() {
    return (
      <div>
        <p>
          {' '}
          <Link to={`/account/${this.state.operations[0]?.to}`}>
            {this.state.operations[0]?.to?.slice(0, 4)}......
            {this.state.operations[0]?.to?.substr(this.state.operations[0]?.to?.length - 4)}{' '}
          </Link>
        </p>
      </div>
    )
  }
}
export default OperationValue

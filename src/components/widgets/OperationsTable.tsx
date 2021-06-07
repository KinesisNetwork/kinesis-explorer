import { Server } from 'js-kinesis-sdk'
import * as React from 'react'

interface Props {
  networkUrl?: string
  translimit: number
}

class OperationsTable extends React.Component<Props> {
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
        <p> {this.state.operations[0]?.type} </p>
      </div>
    )
  }
}
export default OperationsTable

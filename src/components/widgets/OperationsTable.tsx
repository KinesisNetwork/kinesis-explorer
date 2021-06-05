import * as React from 'react'
import { Server } from 'js-kinesis-sdk'

class OperationsTable extends React.Component {
  server = new Server('https://kag-mainnet.kinesisgroup.io')
  state = {
    operations: [],
    name: 'Nitish',
  }

  componentDidMount() {
    this.getOperations()
  }

  async getOperations() {
    console.log('this.state', this.state)
    const operationRecord = await this.server.operations().limit(10).order('desc').call()
    this.setState({ operations: operationRecord.records }, () => {
      this.server
        .operations()
        .cursor('now')
        .limit(1)
        .stream({
          onmessage: (nextData) => {
            console.warn('New Data Recieved!!', nextData.transaction_hash)
            //    this.setState({operations: [nextData, prev.o]})
            //    initialData = [nextData, ...initialData.slice(0, 9)];
            /* Set your state here with initialData */
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
        <p>Hello World from {this.state.name}</p>
        {console.log(this.state.operations, '>>>>>>>>>>>>>>')}
      </div>
    )
  }
}
export default OperationsTable

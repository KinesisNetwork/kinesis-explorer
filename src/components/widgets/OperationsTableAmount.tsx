// import { Server } from 'js-kinesis-sdk'
// import * as React from 'react'

// const Kinesis = require('js-kinesis-sdk')

// interface Props {
//   networkUrl?: string
//   translimit: number
// }

// class OperationsTableAmount extends React.Component<Props> {
//   server = new Server(this.props?.networkUrl)
//   state = {
//     operations: [],
//   }

//   componentDidMount() {
//     this.getOperations()
//   }
//   // componentDidUpdate() {
//   //   this.getOperations()
//   // }

//   async getOperations() {
//     const operationRecord = await this.server.operations().limit(this.props.translimit).order('desc').call()
//     this.setState({ operations: operationRecord.records }, () => {
//       this.server
//         .operations()
//         .cursor('now')
//         .limit(1)
//         .stream({
//           onmessage: (nextData) => {
//             this.setState({
//               operations: [nextData, ...this.state.operations.slice(0, 9)],
//             })
//           },
//         })
//     })
//   }

//   render() {

//     const destinationAccountAddressNetwork = this.state.operations[0]?._links.transaction.href
//     // console.log("destinationAccountAddressNetwork",destinationAccountAddressNetwork);
//     async function fetchDestinationAddressResponse() {
//       const response = await fetch(`${destinationAccountAddressNetwork}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//       })
//       const url = await response.json()
//       const fetchXdr = url.result_xdr
//       return fetchXdr
//     }

//     fetchDestinationAddressResponse().then((fetchXdr) => {
//       // console.log("fetchXdr",fetchXdr);
//     })
//     // console.log("Hello",Kinesis.Hyper.fromXDR()
//     const operationType = this.state.operations[0]?.type

//     let operationAmount

//     if (operationType === 'account_merge') {
//       operationAmount = this.state.operations[0]?.starting_balance
//     }
//     if (operationType === 'create_account') {
//       operationAmount = this.state.operations[0]?.starting_balance
//     }
//     if (operationType === 'payment') {
//       operationAmount = this.state.operations[0]?.amount
//     }
//     operationAmount = operationAmount && parseFloat(operationAmount).toFixed(5)

//     return (
//       <div>
//         <p> {operationAmount} </p>
//       </div>
//     )
//   }
// }
// export default OperationsTableAmount


import React, { useState, useEffect } from "react";
import { OperationRecord, TransactionRecord, AccountRecord , AccountMergeOperationRecord, Server} from 'js-kinesis-sdk'
var StellarSdk = require('stellar-sdk');
class OperationsTable extends React.Component {
 constructor() {
   super();
   this.state = {
     operations: [],
     transaction: 'ABC'
     
   };
 
    this.server = new Server("https://kau-mainnet.kinesisgroup.io");
   
 }

 componentDidMount() {
  this.getOperations()
 }
 
   getOperations  ()  {
  const operationRecord = this.server
  .operations()
  .limit(10)
  .order("desc")
  .call().then(function(initialData){
  this.setState({transaction: "GEF"})


    
    console.log(initialData.records, "i")
 this.setState({operations: initialData.records}
// console.log(this.state.operations, "operations")

 )
   
   })
//  const initialData = operationRecord.records;
//  console.log(operationRecord.records, "records")
//  
//   console.log(this.state.operations, "Operation")
//    server
//    .operations()
//    .cursor("now")
//    .limit(1)
//    .stream({
//    onmessage: (nextData) => {
//    initialData = [nextData, ...initialData.slice(0, 9)];
//    /* Set your state here with initialData */
//    console.log(nextData);
//    console.log("New Length : ", initialData.length);
//    },
//    });
 };
 render() {
   return (
        <h1>{this.state.transaction}</h1>
   );
 }
}

export default OperationsTable;
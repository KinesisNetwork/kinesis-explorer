
import React, { useState, useEffect } from "react";
import { OperationRecord, TransactionRecord, AccountRecord, AccountMergeOperationRecord, Server } from 'js-kinesis-sdk'
// var StellarSdk = require('stellar-sdk');
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


  getOperations() {
    console.log("this.state", this.state)
    const operationRecord = this.server
      .operations()
      .limit(10)
      .order("desc")
      .call().then(function (initialData,callback) {
        return initialData;
      }).then(function (data,){
       console.log("this.state2",data.records)
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
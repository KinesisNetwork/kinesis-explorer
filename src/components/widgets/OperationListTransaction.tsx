import * as React from 'react'

import { CollectionPage, OperationRecord } from 'js-kinesis-sdk'
import { startCase } from 'lodash'
import { Link } from 'react-router-dom'
import { HorizontalLabelledField } from '../shared'

interface Props {
  selectedConnection: any
  operations: CollectionPage<OperationRecord> | null
  conn?: string
}

export class OperationListTransaction extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }
  async addOperationsToTransactionArray(transactionArray) {
    const Array = ''
    const getMemoOperationUrl = this.props.operations.records[0]
    const getInflationDestinationAccount = this.props.operations.records[0]?.['source_account']
    this.props.operations['account'] = getInflationDestinationAccount
  }
  render() {
    const operations = this.props.operations
    const conn = this.props.selectedConnection === undefined ? 'KAU' : this.props.conn
    const op = this.addOperationsToTransactionArray(operations)
    if (operations?.records[0]?.type === 'inflation') {
      const name = 'Source Account'
    } else {
      const name = 'To'
    }
    //     const styles= {
    //       color: 'green',
    //       marginLeft: '-55%',
    //       marginTop: '-24px'

    //   };
    //   const styles1= {
    //     color: 'orange',
    //    marginLeft: '-58%'

    // };
    // const styles2= {
    //   color: 'purple',
    //  marginLeft: '-55%'

    // };
    // const styles3= {
    //   color: 'black',
    //  marginLeft: '-59%'

    // };
    // const styles4= {
    //   color: 'black',
    //  marginLeft: '-57%'

    // };

    return (
      <React.Fragment>
        {operations && operations.records && operations.records.length
          ? operations.records.map((operation, i) => (
              <div>
                {/* <div><b>{operation.type.toUpperCase().replace('_', ' ')} </b></div> */}
                <HorizontalLabelledField label='Type' value={startCase(operation.type)} />
                {/* <h1 style={styles}>{startCase(operation.type ==='account_merge'?operation.type: '')}</h1>
              <h1 style={styles1}>{startCase(operation.type ==='payment'?operation.type: '')}</h1>
              <h1 style={styles2}>{startCase(operation.type ==='create_account'?operation.type: '')}</h1>
              <h1 style={styles3}>{startCase(operation.type ==='inflation'?operation.type: '')}</h1>
              <h1 style={styles4}>{startCase(operation.type ==='set_options'?operation.type: '')}</h1>  */}
                <HorizontalLabelledField
                  label='Transaction Hash'
                  value={
                    <Link to={`/transaction/${conn}/${operation.transaction_hash}`}>{operation.transaction_hash}</Link>}
                />
                <HorizontalLabelledField
                  label={operation?.type === 'inflation' ? 'Source Account' : 'From'}
                  value={
                    <Link to={`/account/${this.props.operations['account']}`}>{this.props.operations['account']}</Link>}
                />
              </div>
            ))
          : null}
      </React.Fragment>
    )
  }
}

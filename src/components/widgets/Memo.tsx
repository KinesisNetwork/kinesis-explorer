import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { Subscribe } from 'unstated'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { getTransaction } from '../../services/kinesis'
import { Connection } from '../../types'
import { TransactionInfo } from '../widgets/TransactionInfo'
import { TransactionMemo } from '../widgets/TransactionMemo'

interface ConnectedTransactionProps extends RouteComponentProps<{ id: string; connection: string }> {}
interface Props extends ConnectedTransactionProps, ConnectionContext {}

interface State {
  transaction: TransactionRecord | null
  invalidTransaction: boolean
  conn: string | undefined
  selectedConnectionName: Connection | undefined
}

class MemoPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { transaction: null, invalidTransaction: false, conn: undefined, selectedConnectionName: undefined }
  }


  

  render() {
   console.log(this.state.transaction, 'transaction..........')
    return (
     
       
  <section className='section'>
        <div className='container'>
        {!this.state.transaction?.memo ? (
            <div />
            ) : (
            <div>
               <h1 className='title'>Transaction</h1>
          {console.log('memo is' , this.state.transaction?.memo)}
          <h2 className='subtitle'>{this.state.transaction.memo}</h2>

            <TransactionMemo
             transaction={this.state.transaction}
            //  memo = {this.state.transaction?.memo}
             conn={this.props.match.params.connection}
             selectedConnection={this.props.selectedConnection}
             
            />
            </div>
          )}


        </div>
        
        </section> 
      
    )
  }
}

class ConnectedTransaction extends React.Component<ConnectedTransactionProps> {
  render() {
    return (
      <Subscribe to={[ConnectionContainer]}>
        {({ state }: ConnectionContainer) => <MemoPage {...this.props} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedTransaction

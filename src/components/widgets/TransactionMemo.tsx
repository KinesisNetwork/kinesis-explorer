import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { convertStroopsToKinesis } from '../../services/kinesis'
import { renderAmount } from '../../utils'
import { HorizontalLabelledField } from '../shared'
import { OperationList } from './OperationList'

let currConn: string
interface KemFee extends TransactionRecord {
  fee_charged?: 0
}

interface Props {
  transaction: KemFee
  conn?: string
  selectedConnection: any
}
interface State {
  operations: CollectionPage<OperationRecord> | null
  query: string
  data: Array<any>
  dataKau:  Array<any>
  dataKag: Array<any>
}
export class TransactionMemo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      operations: null,
      query: '',
      data: [],
      dataKau: [],
      dataKag: [],

      
    }
  }
  loadOperations = async (operations?: any) => {
    operations = await this.props.transaction.operations()
    // this.setState({ operations })
    return [operations]
  }
  handleOperations = async (transaction?: any) => {
    if (!transaction) {
      return
    }
    let [operations] = await this.loadOperations(this.state.operations)
    let operation = this.state.operations
    if (operations && operations.records && operations.records.length > 0) {
      if (this.state.operations && Object.keys(this.state.operations) && Object.keys(this.state.operations).length) {
        operations = await this.getAccountMergedAmount(operations)
        operation['records'] = [...operations.records, ...operation['records']]
      } else {
        operations = await this.getAccountMergedAmount(operations)
        operation = operations
      }
    }
    this.setState({
      operations: operation,
    })
  }
  getAccountMergedAmount = async (operations) => {
    for (const operationsData of operations?.records) {
      const operation = operationsData
      if (operation?.type === 'account_merge') {
        const AmountMergeAddressNetwork = operation?._links.effects?.href
        const response = await fetch(`${AmountMergeAddressNetwork}?order=desc`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
        const url = await response.json()
        const getAccountMergeAmount = url?._embedded?.records[2]?.amount
        operation['amount'] = getAccountMergeAmount
      }
    }
    return operations
  }
  fetchSearch = (query) => {
    const valKau = this.props.selectedConnection.kau.horizonURL
    const searchUrl = `${valKau}/transactions?limit=100&order=desc&q=${query} `
    const valKag = this.props.selectedConnection.kag.horizonURL
    const searchLink = `${valKag}/transactions?limit=100&order=desc&q=${query} `
let dataKau = [...this.state.dataKau] 
let dataKag = [...this.state.dataKag] 
    fetch(searchUrl)
      .then(async function (response) {
        return await response.json()
      })
      .then((response) => {
        const data = response._embedded.records.filter((e) => {
          if (e.memo) {
            return e.memo.toLowerCase().includes(this.state.query.toLowerCase())
          }
        })
        dataKau = [...dataKau, data]
        this.doRecursiveRequest(searchUrl)
        this.doRecursive(searchLink)
      })
      .catch((error) => {
        if (error) {
        }
      })
    
    fetch(searchLink)
      .then(async function (response) {
        return await response.json()
      })
      .then((response) => {
        const data = response._embedded.records.filter((e) => {
          if (e.memo) {
            console.log(e.memo, 'MEMO.......', this.state.query.toLowerCase())
            return e.memo.toLowerCase().includes(this.state.query.toLowerCase())
          }
        })
        dataKag = [...dataKag, data]
      })
      .catch((error) => {
        if (error) {
        }
      })
  }
     doRecursiveRequest = async (searchUrl) => {
      let dataKau = [...this.state.dataKau] 
      return fetch(searchUrl).then(async (res) => {
        
        let currentResult = await res.json()
        if (
          currentResult &&
          currentResult._embedded &&
          currentResult._embedded.records &&
          currentResult._embedded.records.length
        ) {
          const data = currentResult._embedded.records.filter((e) => {
            if (e.memo) {
              return e.memo.toLowerCase().includes(this.state.query.toLowerCase())
            }
          })
          dataKau = [...data, ...dataKau]
          console.log('Kau............', dataKau)
          return this.doRecursiveRequest(currentResult._links.next.href)
        } else {
          return this.doRecursiveRequest(currentResult._links.next.href)
        }
      })
    }
    doRecursive = async (searchLink) => {
      let dataKag = [...this.state.dataKag] 
      return fetch(searchLink).then(async (res) => {
        
        let Result = await res.json()
        if (
          Result &&
          Result._embedded &&
          Result._embedded.records &&
          Result._embedded.records.length
        ) {
          const data = Result._embedded.records.filter((e) => {
            if (e.memo) {
              return e.memo.toLowerCase().includes(this.state.query.toLowerCase())
            }
          })
          dataKag = [...data, ...dataKag]
          console.log('Kag............', dataKag)
          return this.doRecursive(Result._links.next.href)
        } else {
          return this.doRecursive(Result._links.next.href)
        }
      })
    }

   
    
    
    // const value = []
    // const lastValue = this.props.selectedConnection.kau.horizonURL
    // const lastVal = this.props.selectedConnection.kag.horizonURL

    // doRecursiveRequest(`${lastValue}/transactions?limit=100&order=desc`)
    //   .then((data) => {
    //     console.log(data)
    //     const dataKau = data._embedded?.records.filter((e) => e.memo === this.state.query)
    //     console.log('Kau............', dataKau)
    //     value.push(data._embedded.records)
    //     console.log(data._embedded.records.length, 'Embeded')
    //   })

    //   .catch((error) => console.log(error))
    // this.setState({ value })

    // const val = []

    // this.doRecursive(`${lastVal}/transactions?limit=100&order=desc`)
    //   .then((data) => {
    //     console.log(data)
    //     val.push(data._embedded.records)
    //     const dataKag = data._embedded?.records.filter((e) => e.memo === this.state.query)
    //     console.log('............', dataKag)
    //     console.log(data._embedded.records.length, 'Embeded')
    //   })
    //   .catch((error) => console.log(error))
    // this.setState({ val })
  // }
  
  componentDidMount() {
    this.handleOperations(this.props.transaction)
    this.fetchSearch(this.state.query)
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.transaction.id !== this.props.transaction.id) {
    }
  }
  render() {
    const { transaction, conn } = this.props
    const feePaid = transaction.fee_paid || Number(transaction.fee_charged)
    const precision = conn === 'KEM' ? 7 : 5
    const networkType = this.state.operations?.records[0]?._links?.self?.href.slice(12, 19) === 'testnet' ? 'T' : ''
    currConn = networkType + this.state.operations?.records[0]?._links?.self?.href.slice(8, 11).toUpperCase()
    const { query } = this.state
    return (
      <div className="tile is-ancestor">
        <div className="tile is-vertical is-parent">
          <div className="tile is-child box">
            <p className="subtitle">Summary</p>

            <HorizontalLabelledField
              label="Created At"
              value={
                transaction.created_at.slice(8, 10) +
                '/' +
                transaction.created_at.slice(5, 7) +
                '/' +
                transaction.created_at.slice(0, 4) +
                ' ' +
                transaction.created_at.slice(11, 14) +
                transaction.created_at.slice(14, 17) +
                transaction.created_at.slice(17, 19) +
                ' ' +
                'UTC'
              }
            />
            <HorizontalLabelledField
              label="Fee"
              value={renderAmount(convertStroopsToKinesis(feePaid), precision)}
              appendCurr={currConn}
            />
            <HorizontalLabelledField
              label="Ledger"
              value={<Link to={`/ledger/${transaction.ledger_attr}`}>{transaction.ledger_attr}</Link>}
            />
            <HorizontalLabelledField label="Operation Count" value={transaction.operation_count} />
            <HorizontalLabelledField label="Memo" value={query} />
            <HorizontalLabelledField
              label="Source Account"
              value={<Link to={`/account/${transaction.source_account}`}>{transaction.source_account}</Link>}
            />
          </div>
          {/* <div className='tile is-child box'>
            <p className='subtitle'>Signatures</p>
            {/* {this.state.data[0]?._embedded.records.map((record, Key) => {
          return (
            <HorizontalLabelledField label='Memo' value={record.memo} />
 
          );
        })} */}
          {/* {this.state.data[0]?._embedded.records.map((record, Key) => (
              <p>{record.memo}</p>
            ))}
        </div>  */}
        </div>
      </div>
    )
  }
}

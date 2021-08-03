import * as React from 'react'

import { CollectionPage, OperationRecord, TransactionRecord } from 'js-kinesis-sdk'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { Connection } from '../../types'
interface Props extends RouteComponentProps<{ search: string }> {
  selectedConnection: Connection
  transactions: TransactionRecord
}
interface State {
  transactions: TransactionRecord[]
  conn: string | undefined
  // query: string
  query1: string
  data: any[]
  dataKau: any[]
  dataKag: any[]
  value: string
  operations: CollectionPage<OperationRecord> | null
}
export class SearchRedirect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      transactions: [],
      conn: '',
      // query: '',
      data: [],
      dataKau: [],
      dataKag: [],
      operations: null,
      value: '',
      query1: '',
    }
  }
  createQuery = () => {
    const query = window.location.pathname.split('/')
    if (query[1] === 'memo') {
      return query[3].replaceAll('-', ' ').replace('_', '#')
    }
    return query[2]
  }
  render() {
    const { search } = this.props.match.params
    // const { query, query1 } = this.state
    const query = this.createQuery()
    const curr = localStorage.getItem('selectedConnection')

    const getConn = () => {
      if (curr === '0') {
        return 'KAU'
      } else if (curr === '1') {
        return 'KAG'
      } else if (curr === '2') {
        return 'TKAU'
      } else if (curr === '3') {
        return 'TKAG'
      }
    }
    if (parseInt(search, 10).toString() === search.toLowerCase()) {
      return  <Redirect to={`/memo/${getConn()}/${query}`} />
    } else if (!isNaN(parseInt(search, 16))) {
      return <Redirect to={`/transaction/${getConn()}/${search}`} />
    } else {
      return <Redirect to={`/account/${search}`} />
    }
  }
}

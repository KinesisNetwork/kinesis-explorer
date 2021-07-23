import * as React from 'react'

import { Redirect, RouteComponentProps } from 'react-router-dom'

interface Props extends RouteComponentProps<{ search: string }> { }
export class SearchRedirect extends React.Component<Props> {

  render() {
    const { search } = this.props.match.params
    const curr = localStorage.getItem('selectedConnection')
    console.log(this.props.match, 'match...............')
    console.log(this.props.match.params, 'params...............')
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
      return <Redirect to={`/ledger/${search}`} />
    } else if (!isNaN(parseInt(search, 16))) {
      return <Redirect to={`/transaction/${getConn()}/${search}`} />
    } else if (!isNaN(parseInt(search, 16))) {
      return <Redirect to={`/memo/${getConn()}/${search}`} />
    } else {
      return <Redirect to={`/account/${search}`} />
    }
  }
}

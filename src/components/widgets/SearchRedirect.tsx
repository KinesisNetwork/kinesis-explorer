import * as React from 'react'

import { Redirect, RouteComponentProps } from 'react-router-dom'

interface Props extends RouteComponentProps<{ search: string }> { }
export class SearchRedirect extends React.Component<Props> {
  render() {
    const { search } = this.props.match.params
    // console.log(localStorage.getItem('selectedConnection'))
    let curr = localStorage.getItem('selectedConnection')
    let getConn = () => {
      if (curr === '0') {
        return 'KAU'
      } else if (curr === '1') {
        return 'KAG'
      } else if (curr === '2') {
        return 'KAU_test'
      } else if (curr === '3') {
        return 'KAG_test'
      }
    }
    if (parseInt(search, 10).toString() === search.toLowerCase()) {
      return <Redirect to={`/ledger/${search}`} />
    } else if (!isNaN(parseInt(search, 16))) {
      return <Redirect to={`/transaction/${getConn()}/${search}`} />
    } else {
      return <Redirect to={`/account/${search}`} />
    }
  }
}

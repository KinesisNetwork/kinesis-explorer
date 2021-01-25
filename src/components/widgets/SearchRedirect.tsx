import * as React from 'react'

import { Redirect, RouteComponentProps } from 'react-router-dom'

interface Props extends RouteComponentProps<{ search: string }> { }
export class SearchRedirect extends React.Component<Props> {
  render() {
    const { search } = this.props.match.params
    const curr = localStorage.getItem('selectedConnection')
    const getConn = () => {
      if (curr === '0') {
        return 'KAU'
      } else if (curr === '1') {
        return 'KAG'
      } else if (curr === '2') {
        return 'KEM'
      } else if (curr === '3') {
        return 'TKAU'
      } else if (curr === '4') {
        return 'TKAG'
      } else if (curr === '5') {
        return 'TKEM'
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

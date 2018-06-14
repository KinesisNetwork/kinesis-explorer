import * as React from 'react'

import { Redirect, RouteComponentProps } from 'react-router-dom'

interface Props extends RouteComponentProps<{ search: string }> { }
export class SearchRedirect extends React.Component<Props> {
  render() {
    const { search } = this.props.match.params
    if (parseInt(search, 10).toString() === search.toLowerCase()) {
      return <Redirect to={`/ledger/${search}`} />
    } else if (!isNaN(parseInt(search, 16))) {
      return <Redirect to={`/transaction/${search}`} />
    } else {
      return <Redirect to={`/account/${search}`} />
    }
  }
}

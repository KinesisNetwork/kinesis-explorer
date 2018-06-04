import * as React from 'react'
import {
  Redirect,
  Route,
  Switch,
} from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import { TransactionPage } from './layout/Transaction'
import NotFound from './NotFound'

export default class App extends React.Component<null, null> {
  render() {
    return (
      <BrowserRouter basename='/'>
        <Switch>
          <Route exact={true} path='/' component={Dashboard} />
          <Route path='/transaction/:id' component={TransactionPage} />
          <Route path='/404' component={NotFound} />
          <Redirect to='/404' />
        </Switch>
      </BrowserRouter>
    )
  }
}

import * as React from 'react'
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import Dashboard from './Dashboard'
import { AccountPage } from './layout/Account'
import { TransactionPage } from './layout/Transaction'
import NotFound from './NotFound'

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter basename='/'>
        <Switch>
          <Route exact={true} path='/' component={Dashboard} />
          <Route path='/transaction/:id' component={TransactionPage} />
          <Route path='/account/:id' component={AccountPage} />
          <Route path='/404' component={NotFound} />
          <Redirect to='/404' />
        </Switch>
      </BrowserRouter>
    )
  }
}

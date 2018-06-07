import * as React from 'react'
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import { Provider } from 'unstated'
import AccountPage from './layout/Account'
import AppLayout from './layout/AppLayout'
import Dashboard from './layout/Dashboard'
import LedgerPage from './layout/Ledger'
import NotFound from './layout/NotFound'
import TransactionPage from './layout/Transaction'
import { SearchRedirect } from './widgets/SearchRedirect'

export default class App extends React.Component {
  render() {
    return (
      <Provider>
        <BrowserRouter basename='/'>
          <AppLayout>
            <Switch>
              <Route exact={true} path='/' component={Dashboard} />
              <Route path='/account/:id' component={AccountPage} />
              <Route path='/ledger/:sequence' component={LedgerPage} />
              <Route path='/search/:search' component={SearchRedirect} />
              <Route path='/transaction/:id' component={TransactionPage} />
              <Route path='/404' component={NotFound} />
              <Redirect to='/404' />
            </Switch>
          </AppLayout>
        </BrowserRouter>
      </Provider>
    )
  }
}

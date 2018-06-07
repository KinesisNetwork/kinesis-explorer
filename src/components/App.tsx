import * as React from 'react'
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import { Provider } from 'unstated'
import Dashboard from './layout/Dashboard'
import AppLayout from './layout/AppLayout'
import LedgerPage from './layout/Ledger'
import AccountPage from './layout/Account'
import TransactionPage from './layout/Transaction'
import NotFound from './layout/NotFound'
import { SearchRedirect } from './widgets/SearchRedirect'

export default class App extends React.Component {
  render() {
    return (
      <Provider>
        <BrowserRouter basename='/'>
          <AppLayout>
            <Switch>
              <Route exact path='/' component={ Dashboard } />
              <Route path='/account/:id' component={AccountPage} />
              <Route path='/ledger/:sequence' component={ LedgerPage } />
              <Route path='/search/:search' component={SearchRedirect} />
              <Route path='/transaction/:id' component={TransactionPage} />
              <Route path='/404' component={ NotFound } />
              <Redirect to='/404' />
            </Switch>
          </AppLayout>
        </BrowserRouter>
      </Provider>
    )
  }
}

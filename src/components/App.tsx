import * as React from 'react'
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import NotFound from './NotFound'
import Dashboard from './Dashboard'

export default class App extends React.Component<null, null> {
  render() {
    return (
      <Router basename='/'>
        <Switch>
          <Route exact path='/' component={ Dashboard } />
          <Route path='/404' component={ NotFound } />
          <Redirect to='/404' />
        </Switch>
      </Router>
    )
  }
}

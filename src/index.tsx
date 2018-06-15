import * as React from 'react'
import * as ReactDOM from 'react-dom'

import 'event-source-polyfill/src/eventsource.min.js'
import './index.scss'

import { App } from './components'

ReactDOM.render(<App />, document.getElementById('root'))

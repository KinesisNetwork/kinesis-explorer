import * as React from 'react'
import { Provider, Subscribe, Container } from 'unstated'
import { Connection } from '../types'
import { DEFAULT_CONNECTIONS } from './connections'

export interface ConnectionContext {
  connections: Connection[],
  selectedConnection: Connection,
}

export interface ConnectionContextHandlers {
  onConnectionChange: (connection: Connection) => void
}

export class ConnectionContainer extends Container<ConnectionContext> {
  state = {
    connections: DEFAULT_CONNECTIONS,
    selectedConnection: DEFAULT_CONNECTIONS[1],
  }

  onConnectionChange = (connection: Connection): void => {
    this.setState({ selectedConnection: connection })
  }
}

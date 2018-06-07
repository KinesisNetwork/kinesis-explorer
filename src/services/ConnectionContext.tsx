import { Container } from 'unstated'
import { Connection } from '../types'
import { DEFAULT_CONNECTIONS } from './connections'

export interface ConnectionContext {
  connections: Connection[],
  selectedConnection: Connection,
}

export interface ConnectionContextHandlers {
  onChange: (connection: Connection) => void
}

export class ConnectionContainer extends Container<ConnectionContext> {
  state = {
    connections: DEFAULT_CONNECTIONS,
    selectedConnection: DEFAULT_CONNECTIONS[1],
  }

  public onChange = (connection: Connection): void => {
    this.setState({ selectedConnection: connection })
  }
}

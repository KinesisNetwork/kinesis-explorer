import { Container } from 'unstated'
import { Connection } from '../types'
import { fetchConnections } from './connections'

export interface ConnectionContext {
  connections: Connection[],
  selectedConnection: Connection,
  connectionId?: number,
}

export interface ConnectionContextHandlers {
  onChange: (connection: Connection) => void
  fetchConnections: () => Promise<void>
}

export class ConnectionContainer extends Container<ConnectionContext> {
  state = {
    connections: [],
    selectedConnection: {} as Connection,
    connectionId: 0,
  }

  public fetchConnections = async (): Promise<void> => {
    const connections = await fetchConnections()
    this.setState({ connections, selectedConnection: connections[this.state.connectionId] })
  }

  public onChange = (connection: Connection, connectionId?: number): void => {
    this.setState({ selectedConnection: connection, connectionId })
  }
}

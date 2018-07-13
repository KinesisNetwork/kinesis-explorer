import { Container } from 'unstated'
import { Connection } from '../types'
import { fetchConnections } from './connections'

export interface ConnectionContext {
  connections: Connection[],
  selectedConnection: Connection,
}

export interface ConnectionContextHandlers {
  onChange: (connection: Connection) => void
  fetchConnections: () => Promise<void>
}

export class ConnectionContainer extends Container<ConnectionContext> {
  state = {
    connections: [],
    selectedConnection: {} as Connection,
  }

  public fetchConnections = async (): Promise<void> => {
    const connections = await fetchConnections()
    this.setState({ connections, selectedConnection: connections[0] })
  }

  public onChange = (connection: Connection): void => {
    this.setState({ selectedConnection: connection })
  }
}

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
    connections: [] as Connection[],
    selectedConnection: {} as Connection,
    connectionId: 0,
  }

  public fetchConnections = async (): Promise<void> => {
    const connections = await fetchConnections()
    this.setState({ connections, selectedConnection: connections[Number(localStorage.getItem("selectedConnection")) || this.state.connectionId] })
  }

  public onChange = (connection: Connection): void => {
    this.setState({ selectedConnection: connection }, () => {
      this.setState({ connectionId: this.state.connections.indexOf(this.state.selectedConnection) || 0 }, () =>
        localStorage.setItem("selectedConnection", this.state.connectionId.toString())
      )
    })
  }
}

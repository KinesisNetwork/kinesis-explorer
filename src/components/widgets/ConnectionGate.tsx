import React, { Children } from 'react'
import { Subscribe } from 'unstated'
import { ConnectionContainer } from '../../services/connections'

interface Props {
  fetchConnections: () => any
  hasConnections: boolean
}

class ConnectionGateLogic extends React.Component<Props> {
  componentDidMount() {
    this.props.fetchConnections()
  }

  render() {
    if (!this.props.hasConnections) {
      return null
    }

    return <React.Fragment>{this.props.children}</React.Fragment>
  }
}

const ConnectionGate: React.SFC = ({ children }) => (
  <Subscribe to={[ConnectionContainer]}>
    {({ state, fetchConnections }: ConnectionContainer) => (
      <ConnectionGateLogic
        fetchConnections={fetchConnections}
        hasConnections={state.connections.length > 0}
      >
        {children}
      </ConnectionGateLogic>
    )}
  </Subscribe>
)

export default ConnectionGate

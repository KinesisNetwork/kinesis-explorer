import * as React from 'react'
import icon from '../../../icon.png'
import { DEFAULT_CONNECTIONS } from '../../services/connections'
import { Connection } from '../../types'
import { SearchBar } from '../widgets/SearchBar'

enum connections {
  local,
  uat,
}

interface Props {
  connections: Connection[],
  onConnectionChange: (connection: Connection) => void,
  selectedConnection: Connection,
}

interface NetworkSelectProps {
  connections: Connection[],
  isLoading: boolean,
  onConnectionChange: (connection: Connection) => () => void,
  selectedConnection: Connection,
}

interface State {
  isExpanded: boolean,
  isLoading: boolean,
}

class Navigation extends React.Component<Props, State> {
  state = {
    isExpanded: false,
    isLoading: false,
  }

  public toggleExpansion = () => {
    this.setState(({ isExpanded }) => ({ isExpanded: !isExpanded }))
  }

  public get expandedClass() { return this.state.isExpanded ? 'is-active' : '' }

  public handleConnectionChange = (connection: Connection) => () => {
    this.setState({ isLoading: true })
    const timeOut = setTimeout(() => {
      this.props.onConnectionChange(connection)
      this.setState({ isLoading: false })
    }, 500)
  }

  public renderNetworkSelect = ({ connections, isLoading, selectedConnection, onConnectionChange }: NetworkSelectProps): JSX.Element => {
    return (
      <div className='navbar-item has-dropdown is-hoverable'>
        <div className='navbar-link'>
          <span className='icon'>
            <i className={`fas fa-globe ${isLoading && 'fa-spin'}`}></i>
          </span>
          Select Network
          <div className='navbar-dropdown is-right'>
            {connections.map((connection) => (
              <a
                key={connection.name}
                className={`navbar-item ${connection === selectedConnection && 'is-active'}`}
                onClick={onConnectionChange(connection)}
              >
                {connection.name}
              </a>
            ))
            }
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { connections, selectedConnection } = this.props

    return (
      <div className='hero-head'>
        <nav className='navbar' role='navigation' aria-label='navigation'>
          <div className='container'>
            <div className='navbar-brand'>
              <a className='navbar-item'>
                <img src={icon} alt='Logo' />
              </a>
              <span className={`navbar-burger burger ${this.expandedClass}`} onClick={this.toggleExpansion}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
            <div className={`navbar-menu ${this.expandedClass}`}>
              <div className='navbar-start'>
                <a className='navbar-item'>
                  <span className=''>Kinesis Explorer</span>
                </a>
              </div>
              <div className='navbar-end'>
                <a className='navbar-item'>
                  {selectedConnection.name}
                </a>
                {this.renderNetworkSelect({ connections, isLoading: this.state.isLoading, onConnectionChange: this.handleConnectionChange, selectedConnection })}
                <div className='navbar-item'>
                  <SearchBar />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    )
  }
}

export default Navigation

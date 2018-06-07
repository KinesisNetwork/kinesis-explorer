import * as React from 'react'
import { Link } from 'react-router-dom'
import { Subscribe } from 'unstated'
import icon from '../../../icon.png'
import { ConnectionContext, ConnectionContainer, ConnectionContextHandlers } from '../../services/connections'
import { Connection } from '../../types'
import { SearchBar } from '../widgets/SearchBar'

interface NavigationProps extends ConnectionContext, ConnectionContextHandlers {}
interface State {
  isExpanded: boolean,
  isLoading: boolean,
}

interface NetworkSelectProps extends NavigationProps {
  isLoading: boolean,
}

class Navigation extends React.Component<NavigationProps, State> {
  state = {
    isExpanded: false,
    isLoading: false,
  }

  public toggleExpansion = () => {
    this.setState(({ isExpanded }) => ({ isExpanded: !isExpanded }))
  }

  public get expandedClass() { return this.state.isExpanded ? 'is-active' : '' }

  public handleConnectionChange = (handler: (c: Connection) => void, connection: Connection) => () => {
    this.setState({ isLoading: true })
    setTimeout(() => {
      handler(connection)
      this.setState({ isLoading: false })
    }, 500)
  }

  public renderNetworkSelect = ({ connections, isLoading, onConnectionChange, selectedConnection }: NetworkSelectProps): JSX.Element => {
    return (
      <div className='navbar-item has-dropdown is-hoverable'>
        <div className='navbar-link'>
          <span className='icon'>
            <i className={`fas fa-globe ${isLoading && 'fa-spin'}`}></i>
          </span>
          Select Network
          <div className='navbar-dropdown is-right'>
            {connections.map((connection) => (
              <Link
                key={connection.name}
                to={'/'}
                className={`navbar-item ${connection === selectedConnection && 'is-active'}`}
                onClick={this.handleConnectionChange(onConnectionChange, connection)}
              >
                {connection.name}
              </Link>
              ))
            }
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { connections, onConnectionChange, selectedConnection } = this.props

    return (
      <nav className='navbar' role='navigation' aria-label='navigation'>
        <div className='container'>
          <div className='navbar-brand'>
            <Link to={'/'} className='navbar-item'>
              <img src={icon} alt='Logo' />
            </Link>
            <span className={`navbar-burger burger ${this.expandedClass}`} onClick={this.toggleExpansion}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
          <div className={`navbar-menu ${this.expandedClass}`}>
            <div className='navbar-start'>
              <Link to={'/'} className='navbar-item'>
                <span className=''>Kinesis Explorer</span>
              </Link>
            </div>
            <div className='navbar-end'>
              <a className='navbar-item'>
                {selectedConnection.name}
              </a>
              {
                this.renderNetworkSelect({
                  connections: connections,
                  isLoading: this.state.isLoading,
                  onConnectionChange,
                  selectedConnection: selectedConnection
                })
              }
              <div className='navbar-item'>
                <SearchBar />
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }
}

class ConnectedNavigation extends React.Component {
  render() {
    return (
      <Subscribe to={[ ConnectionContainer ]}>
        { ({ onConnectionChange, state }: ConnectionContainer) => <Navigation onConnectionChange={onConnectionChange} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedNavigation

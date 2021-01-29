import * as React from 'react'
import { Link } from 'react-router-dom'
import { Subscribe } from 'unstated'

import icon from '../../../icon.svg'
import {
  ConnectionContainer,
  ConnectionContext,
  ConnectionContextHandlers,
} from '../../services/connections'
import { Connection } from '../../types'
import { SearchBar } from '../widgets/SearchBar'

interface NavigationProps
  extends ConnectionContext,
  ConnectionContextHandlers { }
interface State {
  isExpanded: boolean
  isLoading: boolean
}

class Navigation extends React.Component<NavigationProps, State> {
  state = {
    isExpanded: false,
    isLoading: false,
  }

  public toggleExpansion = () => {
    this.setState(({ isExpanded }) => ({ isExpanded: !isExpanded }))
  }

  public get expandedClass() {
    return this.state.isExpanded ? 'is-active' : ''
  }

  connectionSelector = (connection: Connection) => (
    <Link
      key={connection.name}
      to={'/'}
      className={`navbar-item ${connection === this.props.selectedConnection &&
        'is-active'}`}
      onClick={() => this.props.onChange(connection)}
    >
      {connection.name}
    </Link>
  )

  public renderNetworkSelect = () => {
    const { connections } = this.props
    // const connections: Connection[] = [
    //   {
    //     name: 'Kinesis KAU Mainnet',
    //     horizonURL: 'https://kau-mainnet.kinesisgroup.io',
    //     networkPassphrase: "Kinesis Live",
    //     stage: "mainnet",
    //     currency: "KAU"
    //   },
    //   {
    //     name: "Kinesis KAG Mainnet",
    //     horizonURL: "https://kag-mainnet.kinesisgroup.io",
    //     networkPassphrase: "Kinesis KAG Live",
    //     stage: "mainnet",
    //     currency: "KAG"
    //   },
    //   {
    //     name: "Kinesis KEM Mainnet",
    //     horizonURL: "https://kem-mainnet.kinesisgroup.io",
    //     networkPassphrase: "Kinesis KEM Live",
    //     stage: "mainnet",
    //     currency: "KEM"
    //   },
    //   {
    //     name: "Kinesis KAU Testnet",
    //     horizonURL: "https://kau-testnet.kinesisgroup.io",
    //     networkPassphrase: "Kinesis UAT",
    //     stage: "testnet",
    //     currency: "KAU"
    //   },
    //   {
    //     name: "Kinesis KAG Testnet",
    //     horizonURL: "https://kag-testnet.kinesisgroup.io",
    //     networkPassphrase: "Kinesis KAG UAT",
    //     stage: "testnet",
    //     currency: "KAG"
    //   },
    //   {
    //     name: "Kinesis KEM Testnet",
    //     horizonURL: "https://kem-testnet.kinesisgroup.io",
    //     networkPassphrase: "Kinesis KEM UAT",
    //     stage: "testnet",
    //     currency: "KEM"
    //   }
    // ]
    const { isLoading } = this.state

    return (
      <div className='navbar-item has-dropdown is-hoverable'>
        <div className='navbar-link'>
          <span className='icon'>
            <i className={`fas fa-globe ${isLoading && 'fa-spin'}`} />
          </span>
          Select Network
          <div className='navbar-dropdown is-right'>
            {connections.map((connection) => this.connectionSelector(connection))}
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { selectedConnection } = this.props
    return (
      <nav className='navbar' role='navigation' aria-label='navigation'>
        <div className='container'>
          <div className='navbar-brand'>
            <Link to={'/'} className='navbar-item'>
              <img src={icon} alt='Logo' style={{ marginTop: '4px' }} />
            </Link>
            <span
              className={`navbar-burger burger ${this.expandedClass}`}
              onClick={this.toggleExpansion}
            >
              <span />
              <span />
              <span />
            </span>
          </div>
          <div className={`navbar-menu ${this.expandedClass}`}>
            {/* <div className='navbar-start'>
              <Link to={'/'} className='navbar-item'>
                <span className=''>Kinesis Explorer</span>
              </Link>
            </div> */}
            <div className='navbar-end'>
              <a className='navbar-item'>{selectedConnection.name}</a>
              {this.renderNetworkSelect()}
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
  renderChildren = ({
    fetchConnections,
    onChange,
    state,
  }: ConnectionContainer) => (
    <Navigation
      fetchConnections={fetchConnections}
      onChange={onChange}
      {...state}
    />
  )

  render() {
    return (
      <Subscribe to={[ConnectionContainer]}>{this.renderChildren}</Subscribe>
    )
  }
}

export default ConnectedNavigation

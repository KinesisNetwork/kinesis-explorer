import axios from 'axios'
import * as React from 'react'

const enum Environments {
  kauTestnet = 'kau-testnet',
  kagTestnet = 'kag-testnet',
  kauMainnet = 'kau-mainnet',
  kagMainnet = 'kag-mainnet',
}

const REGION_ERROR = { error: 'Region Offline' }

const MONITOR_ENDPOINTS = {
  [Environments.kauMainnet]: [
    'https://kau-mainnet-oceania.kinesisgroup.io:3000',
    'https://kau-mainnet-asia.kinesisgroup.io:3000',
    'https://kau-mainnet-america.kinesisgroup.io:3000',
    'https://kau-mainnet-europe.kinesisgroup.io:3000',
  ],
  [Environments.kagMainnet]: [
    'https://kag-mainnet-oceania.kinesisgroup.io:3000',
    'https://kag-mainnet-asia.kinesisgroup.io:3000',
    'https://kag-mainnet-america.kinesisgroup.io:3000',
    'https://kag-mainnet-europe.kinesisgroup.io:3000',
  ],
  [Environments.kauTestnet]: [
    'https://kau-testnet-oceania.kinesisgroup.io:3000',
    'https://kau-testnet-asia.kinesisgroup.io:3000',
    'https://kau-testnet-america.kinesisgroup.io:3000',
    'https://kau-testnet-europe.kinesisgroup.io:3000',
  ],
  [Environments.kagTestnet]: [
    'https://kag-testnet-oceania-node0.kinesisgroup.io:3000',
    'https://kag-testnet-oceania-node1.kinesisgroup.io:3000',
    'https://kag-testnet-ireland-node0.kinesisgroup.io:3000',
    'https://kag-testnet-ireland-node1.kinesisgroup.io:3000',
  ],
}

function getInfo(ep: string) {
  return axios
    .get(ep)
    .then((d) => d.data)
    .catch(() => REGION_ERROR)
}

async function loadData() {
  const data = await Promise.all(
    Object.entries(MONITOR_ENDPOINTS).map(async ([environment, endpoints]) => {
      const envInfo = await Promise.all(
        endpoints.map(async (ep) => {
          const info = await getInfo(ep)
          return { [ep]: info }
        }),
      )

      const mergedEnvInfo = envInfo.reduce(
        (acc, val) => ({ ...acc, ...val }),
        {},
      )
      return { [environment]: mergedEnvInfo }
    }),
  )

  return data.reduce((acc, val) => ({ ...acc, ...val }), {})
}

export default class NodeInfo extends React.Component<
  any,
  { nodeInfo: any; interval?: any }
  > {
  state = { nodeInfo: {}, interval: undefined }

  async componentDidMount() {
    const setDataOnState = async () => {
      const nodeInfo = await loadData()
      this.setState({ nodeInfo })
    }

    const interval = setInterval(setDataOnState, 120000)
    this.setState({ interval })
    setDataOnState()
  }

  componentWillUnmount() {
    clearInterval(this.state.interval)
  }

  public generateView() {
    const nodeInfo: any = this.state.nodeInfo
    const networks = Object.keys(nodeInfo)

    return networks.map((network) => {
      const networkRegionInfo = nodeInfo[network]

      return (
        <React.Fragment key={network}>
          <h1 className='title is-3'>{network}</h1>
          <div className='columns'>
            {this.generateRegionView(networkRegionInfo)}
          </div>
        </React.Fragment>
      )
    })
  }

  public generateRegionView(networkRegionInfo: any) {
    const regions = Object.keys(networkRegionInfo)
    return regions.map((region) => {
      const regionNodeInfo = networkRegionInfo[region]

      return (
        <React.Fragment key={region}>
          <div className='column'>
            <h2 className='title is-4'>{region}</h2>
            {regionNodeInfo === REGION_ERROR ? (
              <h3 className='title is-5 has-text-danger'>Region Offline</h3>
            ) : (
                this.generateNodeView(regionNodeInfo)
              )}
          </div>
        </React.Fragment>
      )
    })
  }

  public generateNodeView(regionNodeInfo: any) {
    const nodes = Object.keys(regionNodeInfo)

    return nodes.map((node) => {
      const currentNode = regionNodeInfo[node]

      const { info } = currentNode
      const { quorum, ledger, state } = info
      const { agree } = quorum
        ? (Object.values(quorum)[0] as any)
        : { agree: 0 }
      return (
        <React.Fragment key={node}>
          <h2 className='title is-4' style={{ paddingTop: '15px' }}>
            {node}
          </h2>
          <p>State: {state}</p>
          <p>
            Quorum Count:
            <span className={agree < 12 ? 'has-text-danger' : ''}>{agree}</span>
          </p>
          <p>Ledger Age: {ledger.age}</p>
          <p>Ledger Number: {ledger.num}</p>
          <p>Ledger Percentage Fee (b.p): {ledger.basePercentageFee}</p>
          <p>Ledger Base Fee (stroops): {ledger.baseFee}</p>
        </React.Fragment>
      )
    })
  }

  render() {
    return (
      <div className='container'>
        <h1 className='title is-2'>Node Infomation</h1>
        {this.generateView()}
      </div>
    )
  }
}

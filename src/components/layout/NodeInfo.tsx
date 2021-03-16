import axios from 'axios'
import * as React from 'react'
import '../css/custom.css'
import KagIcon from '../css/images/kag-icon.svg'
import KauIcon from '../css/images/kau-icon.svg'
import KemIcon from '../css/images/kem-icon.svg'

const enum Environments {
  kauTestnet = 'kau-testnet',
  kagTestnet = 'kag-testnet',
  kauMainnet = 'kau-mainnet',
  kagMainnet = 'kag-mainnet',
  kemTestnet = 'kem-testnet',
  kemMainnet = 'kem-mainnet',
}

const REGION_ERROR = { error: 'Region Offline' }

const COMPANY_ENDPOINTS = {
  [Environments.kauMainnet]: [
    'Leeway',
    'ABX',
    'Leeway',
    'Kinesis',
  ],
}

const hello = {
  "kauMainnet" : [
    {
      nodeUrl : "https://kau-mainnet-oceania.kinesisgroup.io:3000",
      account : "Kinesis"
    },
    {
      nodeUrl : "https://kau-mainnet-asia.kinesisgroup.io:3000",
      account : "Kinesis"
    },
    {
      nodeUrl : "https://kau-mainnet-america.kinesisgroup.io:3000",
      account : "Kinesis"
    },
       {
      nodeUrl : "https://kau-mainnet-europe.kinesisgroup.io:3000",
      account : "Kinesis"
    }
  ],

}


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
  [Environments.kemMainnet]: [
    'https://kem-mainnet-oceania1.kinesisgroup.io:3000',
    'https://kem-mainnet-asia1.kinesisgroup.io:3000',
    'https://kem-mainnet-america1.kinesisgroup.io:3000',
    'https://kem-mainnet-europe1.kinesisgroup.io:3000',
  ],
  [Environments.kauTestnet]: [
    'https://kau-testnet-london0.kinesisgroup.io:3000',
    'https://kau-testnet-london1.kinesisgroup.io:3000',
    'https://kau-testnet-oceania1.kinesisgroup.io:3000',
    'https://kau-testnet-oceania2.kinesisgroup.io:3000',
  ],
  [Environments.kagTestnet]: [
    'https://kag-testnet-oceania0.kinesisgroup.io:3000',
    'https://kag-testnet-oceania1.kinesisgroup.io:3000',
    'https://kag-testnet-america0.kinesisgroup.io:3000',
    'https://kag-testnet-america1.kinesisgroup.io:3000',
  ],
  [Environments.kemTestnet]: [
    'https://kem-testnet-america0.kinesisgroup.io:3000',
    'https://kem-testnet-america1.kinesisgroup.io:3000',
    'https://kem-testnet-america2.kinesisgroup.io:3000',
    'https://kem-testnet-america3.kinesisgroup.io:3000',
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

      const mergedEnvInfo = envInfo.reduce((acc, val) => ({ ...acc, ...val }), {})
      return { [environment]: mergedEnvInfo }
    }),
  )

  return data.reduce((acc, val) => ({ ...acc, ...val }), {})
}

export default class NodeInfo extends React.Component<any, { nodeInfo: any; interval?: any }> {
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

  public generateHeader(network) {
    return (
      <div className="header-info display-flex-outer" >
        <div className="display-flex right-header">
          <div>
            <img src={network.includes("kau") ? KauIcon : network.includes("kag") ? KagIcon : KemIcon} className="image-icon" />
          </div>
          <div >
            <h1 className='text-data'>{network}</h1>
          </div>
        </div>
        <div className="display-flex left-header" >
          <div>
            <input type="checkbox" />
            <span className="span-data check-box-text-padding">Kinesis Node</span>
          </div>
          <div>
            <input type="checkbox" /><span className="span-data check-box-text-padding">Idependent Node</span>
          </div>
        </div>
      </div>
    )
  }

  public generateView() {
    const nodeInfo: any = this.state.nodeInfo
    const networks = Object.keys(nodeInfo)

    return networks.map((network) => {
      const networkRegionInfo = nodeInfo[network]

      return (
        <React.Fragment key={network}>
          {this.generateHeader(network)}
          {this.generateRegionView(networkRegionInfo).length >= 4 ?
            <div className='columns'>{this.generateRegionView(networkRegionInfo).slice(0, 4)}
            </div> : ''}
          {this.generateRegionView(networkRegionInfo).length > 4 ?
            <div className='columns'>{this.generateRegionView(networkRegionInfo).slice(4, 8)}
            </div> : ''}
          {/* <div className='columns'>{this.generateRegionView(networkRegionInfo)}</div> */}
        </React.Fragment>
      )
    })
  }

  public generateRegionView(networkRegionInfo: any) {
    const regions = Object.keys(networkRegionInfo)
    return regions.map((region) => {
      const regionNodeInfo = networkRegionInfo[region]
      let regionArea = region.split('-')[2].split('.')[0]

      return (
        <React.Fragment key={region}>
          <div className='column node-info-details '>
            <div className="region-header">
              {/* <h2 className='title is-4'>{region}</h2> */}
              <div className='display-space'>
                <img src={KauIcon} className="image-icon icon-padding" />
              </div>
            </div>
            {regionNodeInfo === REGION_ERROR ? (
              <h3 className='title is-5 has-text-danger'>Region Offline</h3>
            ) : (
              this.generateNodeView(regionNodeInfo , regionArea ,region)
            )}
          </div>
        </React.Fragment>
      )
    })
  }

  public generateNodeView(regionNodeInfo: any , regionArea : string , region : string) {
    const nodes = Object.keys(regionNodeInfo)

    return nodes.map((node) => {
      const currentNode = regionNodeInfo[node]
      const { info } = currentNode
      const { quorum, ledger, state, protocol_version } = info
      const qSet = () => {
        if (protocol_version > 9) {
          return Object.values(quorum)[1] as any
        } else {
          return Object.values(quorum)[0] as any
        }
      }

      const { agree } = quorum ? qSet() : { agree: 0 }
      return (
        <React.Fragment key={node}>
          <div className="individual-indetails">
            <h4 className='title is-4' style={{ paddingTop: '15px' }}>
             <a target="_blank" href={region}>{regionArea +  " "  +node[4]}</a>
            </h4>
            <p className="para-text">State: <span className="font-bolder">{state}</span></p>
            <p className="para-text">
              Quorum Count:
            {/* <span className={agree < 12 ? 'has-text-danger' : ''}>{agree}</span> */}
              <span className="font-bolder"> {agree}</span>
            </p>
            <p className="para-text">Ledger Age: <span className="font-bolder" >{ledger.age}</span></p>
            <p className="para-text">Ledger Number:  <span className="font-bolder" >{ledger.num}</span></p>
            <p className="para-text">Ledger Percentage Fee (b.p): <span className="font-bolder" >{ledger.basePercentageFee}</span></p>
            <p className="para-text">Ledger Base Fee (stroops): <span className="font-bolder" >{ledger.baseFee}</span></p>
          </div>
        </React.Fragment>
      )
    })
  }
  render() {
    return (
      <div className='container'>
        <h1 className=' Node-Information '>Node Infomation</h1>
        {this.generateView()}
      </div>
    )
  }
}

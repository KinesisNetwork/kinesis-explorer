import axios from 'axios'
import * as React from 'react'
import '../css/custom.css'
import KagIcon from '../css/images/kag-icon.svg'
import KauIcon from '../css/images/kau-icon.svg'
import KemIcon from '../css/images/kem-icon.svg'
import KinesisLogo from '../css/images/KinesisIcon.svg'
import LeewayLogo from '../css/images/LH.svg'
import AbxLogo from '../css/images/ABX_logo.svg'

const REGION_ERROR = { error: 'Region Offline' }


function getInfo(ep: string) {
  return axios
    .get(ep)
    .then((d) => d.data)
    .catch(() => REGION_ERROR)
}

interface endpoints {
  [n: string] : {
    nodeUrl : string,
    account : string
  }
}

async function loadData() {
  const nodesData = await axios.get("https://kinesis-config.s3-ap-southeast-2.amazonaws.com/kinesis-explorer-uat.json").then((d) => d.data) 
  const data = await Promise.all(
    Object.entries(nodesData).map(async ([environment, endpoints]) => {
    
      const envInfo = await Promise.all(
        endpoints.map(async (ep) => {
          const info = await getInfo(ep.nodeUrl)
          // info.account = info.account
          return { [ep.nodeUrl]: { ...info , account: ep.account} }
        }),
      )
      const mergedEnvInfo = envInfo.reduce((acc, val) => {
         return { ...acc, ...val }
      } , {})
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
            {this.generateRegionView(networkRegionInfo).length > 8 ?
            <div className='columns'>{this.generateRegionView(networkRegionInfo).slice(8, 12)}
            </div> : ''}
            {this.generateRegionView(networkRegionInfo).length > 12 ?
            <div className='columns'>{this.generateRegionView(networkRegionInfo).slice(12, 16)}
            </div> : ''}
            {this.generateRegionView(networkRegionInfo).length > 16 ?
            <div className='columns'>{this.generateRegionView(networkRegionInfo).slice(16, 20)}
            </div> : ''}
            {this.generateRegionView(networkRegionInfo).length > 20 ?
            <div className='columns'>{this.generateRegionView(networkRegionInfo).slice(20, 24)}
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

      let { account } = regionNodeInfo

      return (
        <React.Fragment key={region}>
          <div className='column node-info-details '>
            <div className="region-header">
              {/* <h2 className='title is-4'>{region}</h2> */}
              <div className='display-space'>
                <img src={account == "Kinesis" ?KinesisLogo : account == "leewayhertz" ? LeewayLogo : AbxLogo} className="image-icon icon-padding" />
                {/* <p>{account}</p> */}
              </div>
            </div>
            {regionNodeInfo.error === REGION_ERROR.error ? (
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

      if(typeof currentNode === 'object') {
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
               <a target="_blank" href={region}>{regionArea.includes('0') || regionArea.includes('1') || regionArea.includes('2') || regionArea.includes('3') ? regionArea : regionArea +  " "  +node[4]}</a>
              </h4>
              <p className="para-text">State: <span className="font-bolder">{state}</span></p>
              <p className="para-text">
                Quorum Count:
              {/* <span className={agree < 12 ? 'has-text-danger' : ''}>{agree}</span> */}
                <span className="font-bolder"> {agree}</span>
              </p>
              <p className="para-text">Ledger Age: <span className="font-bolder" >{ledger.age}</span></p>
              <p className="para-text">Ledger Number:  <span className="font-bolder" >{ledger.num}</span></p>
              <p className="para-text">Ledger Percentage Fee (b.p): <span className="font-bolder" >{ledger.basePercentageFee || 45}</span></p>
              <p className="para-text">Ledger Base Fee (stroops): <span className="font-bolder" >{ledger.baseFee}</span></p>
            </div>
          </React.Fragment>
        )
      }

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

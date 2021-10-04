import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { Subscribe } from 'unstated'
import icon from '../../../icon.svg'
import { ConnectionContainer, ConnectionContext } from '../../services/connections'
import { getTransaction } from '../../services/kinesis'
import { Connection } from '../../types'
import Logo from '../css/images/copy.svg'
import { TransactionInfo } from '../widgets/TransactionInfo'

// import { TransactionMemo } from '../widgets/TransactionMemo'

interface ConnectedTransactionProps extends RouteComponentProps<{ id: string; connection: string }> {}
interface Props extends ConnectedTransactionProps, ConnectionContext {}

interface State {
  transaction: TransactionRecord | null
  invalidTransaction: boolean
  conn: string | undefined
  selectedConnectionName: Connection | undefined
  copySuccess: boolean
  tool_tip_content: string
  amount: TransactionRecord | null
}

class TransactionPage extends React.Component<Props, State> {
  textArea: any
  constructor(props: Props) {
    super(props)
    this.state = {
      transaction: null,
      invalidTransaction: false,
      conn: undefined,
      selectedConnectionName: undefined,
      copySuccess: false,
      tool_tip_content: '',
      amount: null,
    }
  }

  getId = (val: string) => {
    if (val === 'KAU') {
      return 0
    } else if (val === 'KAG') {
      return 1
    } else if (val === 'TKAU') {
      return 2
    } else if (val === 'TKAG') {
      return 3
    }
  }
  loadTransaction = async () => {
    // try {
    const elementMainnet = this.props.connections[0]
    const elementTestnet = this.props.connections[1]
    //   try {
    //     const value = await getTransaction(element, this.props.match.params.id)
    //     this.setState({ transaction: value, selectedConnectionName: element })
    //   } catch (err) {
    //     // tslint:disable-next-line:no-console
    //     console.error(err)
    //   }
    // } catch (e) {
    //   this.setState({ invalidTransaction: true })
    // }
    // console.log(records, 'records')
    const recordsKau = new Promise((resolve, reject) => {
      resolve(getTransaction(elementMainnet, this.props.match.params.id))
    })
    const recordsKag = new Promise((resolve, reject) => {
      resolve(getTransaction(elementTestnet, this.props.match.params.id))
    })
    const outputKau = Promise.all([recordsKau])
      .then((res) => {
        return res[0]
      })
      .catch((err) => {
        return []
      })
    const outputKag = Promise.all([recordsKag])
      .then((res) => {
        return res[0]
      })
      .catch((err) => {
        return []
      })
    const Kau: any = await outputKau.then((result) => result)
    let records
    const Kag: any = await outputKag.then((result) => result)
    records = [Kau, Kag]
    //  console.log(records, 'rec...')
    const data = elementMainnet || elementTestnet
    // this.setState({transaction: records[1], selectedConnectionName: data })
    this.setState({ transaction: records[0] ? records[0] : records[1], selectedConnectionName: data })
    if (records[1]) {
      localStorage.setItem('selectedConnection', '1')

      if (window.localStorage) {
        if (!localStorage.getItem('reload')) {
          localStorage['reload'] = true
          window.location.reload()
          // console.log('true....')
        } else {
          localStorage.removeItem('reload')
          // console.log('false....')
        }
      }
    } else if (records[0]) {
      localStorage.setItem('selectedConnection', '0')
      // console.log('mainnet.....')

      if (!localStorage.getItem('reload')) {
        localStorage['reload'] = true
        window.location.reload()
        // console.log('true....')
      } else {
        // If there exists a 'reload' item
        // then clear the 'reload' item in
        // local storage
        // console.log('false....')
        localStorage.removeItem('reload')
      }
    }
    return records
  }

  componentDidMount() {
    this.loadTransaction()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.loadTransaction()
    }
  }
  createQuery = () => {
    const query = window.location.pathname.split('/')
    if (query[1] === 'memo') {
      return query[3].replaceAll('-', ' ').replace('_', '#')
    }
    return query[2]
  }
  // copyCodeToClipboard = () => {
  //   // const el = this.textArea
  //   // el.select()

  //   var el = document.createElement('textarea')
  //   el.value = this.props.match.params.id
  //   el.setAttribute('readonly', '')
  //   document.body.appendChild(el)
  //   el.select()
  //   document.execCommand('copy')
  //   document.body.removeChild(el)
  //   this.setState({ copySuccess: true })
  // }
  // refreshPage() {
  //   const refresh = window.location.reload()
  //   return refresh
  //   // console.log(this.props.accountId, 'accountid...')
  // }
  render() {
    const query = this.createQuery()
    const curr = localStorage.getItem('selectedConnection')
    const getConn = () => {
      if (curr === '0') {
        return 'KAU'
      } else if (curr === '1') {
        return 'KAG'
      } else if (curr === '2') {
        return 'TKAU'
      } else if (curr === '3') {
        return 'TKAG'
      }
    }
    if (this.state.invalidTransaction) {
      return <Redirect to={`/memo/${getConn()}/${query}`} />
    }
    return (
      <section className='section'>
        <div className='container'>
          <h1 className='title'>Transaction</h1>
          {/* {console.log('memo is' , this.state.transaction?.memo)} */}
          {/* <h2 className="subtitle" ref={(textarea) => (this.textArea = textarea)}>
            {this.props.match.params.id}
            {this.state.copySuccess ? (
              <button style={{ backgroundColor: 'white', borderBlock: 'none', border: 'none' }}>
                <p data-tip="Copied!">
                  {' '}
                  <img
                    src={Logo}
                    className={'image-icon'}
                    style={{ height: '28px' }}
                    onClick={() => this.copyCodeToClipboard()}
                  />
                </p>
                <ReactTooltip backgroundColor={'#017DE8'} />
              </button>
            ) : (
              <button style={{ backgroundColor: 'white', borderBlock: 'none', border: 'none' }}>
                {' '}
                <p data-tip="Copy Transaction Hash" onClick={() => this.copyCodeToClipboard()}>
                  <img src={Logo} className={'image-icon'} style={{ height: '28px' }} />
                </p>
                <ReactTooltip backgroundColor={'#017DE8'} />{' '}
              </button>
            )} */}
          <h2 className='subtitle'>{this.props.match.params.id}</h2>

          {!this.state.transaction ? (
            <div />
          ) : (
            <TransactionInfo
              transaction={this.state.transaction}
              conn={this.props.match.params.connection}
              selectedConnection={this.props.selectedConnection}
            />
          )}
          {/* <section className='section'>
        <div className='container'>
        {!this.state.transaction?.memo ? (
            <div />
            ) : (
            <div>
               <h1 className='title'>Transaction</h1>
          {console.log('memo is' , this.state.transaction?.memo)}
          <h2 className='subtitle'>{this.state.transaction.memo}</h2>

            <TransactionMemo
             transaction={this.state.transaction}
            //  memo = {this.state.transaction?.memo}
             conn={this.props.match.params.connection}
             selectedConnection={this.props.selectedConnection}

            />
            </div>
          )}

        </div>

        </section> */}
        </div>
      </section>
    )
  }
}

class ConnectedTransaction extends React.Component<ConnectedTransactionProps> {
  render() {
    return (
      <Subscribe to={[ConnectionContainer]}>
        {({ state }: ConnectionContainer) => <TransactionPage {...this.props} {...state} />}
      </Subscribe>
    )
  }
}

export default ConnectedTransaction

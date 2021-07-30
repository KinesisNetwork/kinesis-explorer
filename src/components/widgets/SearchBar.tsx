import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { Connection } from '../../types'
interface State {
  transaction: TransactionRecord | null
  invalidTransaction: boolean
  conn: string | undefined
}
interface OperationProps {
  selectedConnection: Connection
}

export class SearchBar extends React.Component<OperationProps> {
  state = {
    value: '',
    clicked: false,
    searchedValue: '',
    query: '',
    loading: false,
    message: '',
    results: {},
    operations: [],
    selectedConnection: '',
    data: [],
    redirectUrl: '/search/memo',
  }
  handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    // console.log(event.currentTarget.value, 'querytyped.......')
    this.setState({ value: event.currentTarget.value })
    const query = event.target.value
    this.setState({ query: event.target.value, loading: true, message: '' }, () => {
      // console.log(event.currentTarget.value, 'querytyped.......')
    })
  }
  clearInput: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    this.setState({ value: '', redirectUrl: '/search/memo' })
    // const query = event.target.value
    // // console.log(query, 'query.........')
    // this.setState({ query: event.target.value, loading: true, message: '' }, () => {
    //   this.fetchSearch(query)
    // })
  }
  // fetchSearch = (query) => {
  //   const valKau = this.props.selectedConnection.kau.horizonURL
  //   const searchUrl = `${valKau}/transactions?limit=100&order=desc&q=${query} `
  //   const valKag = this.props.selectedConnection.kag.horizonURL
  //   const searchLink = `${valKag}/transactions?limit=100&order=desc&q=${query} `

  //   fetch(searchUrl)
  //     .then(async function(response) {
  //       return await response.json()
  //     })
  //     .then((response) => {
  //       const dataKau = response._embedded.records.filter((e) => {
  //         if (e.memo) {
  //           return e.memo.toLowerCase().includes(this.state.query.toLowerCase())
  //         }
  //       })
  //       console.log('Data Kau............', dataKau)
  //       doRecursiveRequest(searchUrl)
  //       doRecursive(searchLink)
  //     })
  //     .catch((error) => {
  //       if (error) {
  //       }
  //     })

  //   fetch(searchLink)
  //     .then(async function(response) {
  //       return await response.json()
  //     })
  //     .then((response) => {
  //       const dataKag = response._embedded.records.filter((e) => {
  //         if (e.memo) {
  //           console.log(e.memo, 'MEMO.......', this.state.query.toLowerCase())
  //           return e.memo.toLowerCase().includes(this.state.query.toLowerCase())
  //         }
  //       })
  //       console.log('Data Kag.............', dataKag)
  //     })

  //     .catch((error) => {
  //       if (error) {
  //       }
  //     })

  //   let returningValue = []
  //   let currentResult
  //   const doRecursiveRequest = async (searchUrl) => {
  //     return fetch(searchUrl).then(async (res) => {
  //       currentResult = await res.json()
  //       if (
  //         currentResult &&
  //         currentResult._embedded &&
  //         currentResult._embedded.records &&
  //         currentResult._embedded.records.length
  //       ) {
  //         const dataKau = currentResult._embedded.records.filter((e) => {
  //           if (e.memo) {
  //             return e.memo.toLowerCase().includes(this.state.query.toLowerCase())
  //           }
  //         })
  //         returningValue = [...returningValue, ...dataKau]
  //         console.log('Kau............', dataKau)
  //         return doRecursiveRequest(currentResult._links.next.href)
  //       } else {
  //         return doRecursiveRequest(currentResult._links.next.href)
  //       }
  //     })
  //   }
  //   let returningVal = []
  //   let Result
  //   const doRecursive = async (searchLink) => {
  //     return fetch(searchLink).then(async (res) => {
  //       // if (currentResult === undefined) {
  //       Result = await res.json()
  //       if (Result && Result._embedded && Result._embedded.records && Result._embedded.records.length) {
  //         const dataKag = Result._embedded.records.filter((e) => {
  //           if (e.memo) {
  //             return e.memo.toLowerCase().includes(this.state.query.toLowerCase())
  //           }
  //         })

  //         returningVal = [...returningVal, ...dataKag]
  //         console.log('Kag............', dataKag)
  //         return doRecursive(Result._links.next.href)
  //       } else {
  //         return doRecursive(Result._links.next.href)
  //       }
  //     })
  //   }
  //   const value = []
  //   const lastValue = this.props.selectedConnection.kau.horizonURL
  //   const lastVal = this.props.selectedConnection.kag.horizonURL

  //   doRecursiveRequest(`${lastValue}/transactions?limit=100&order=desc`)
  //     .then((data) => {
  //       console.log(data)
  //       const dataKau = data._embedded?.records.filter((e) => e.memo === this.state.query)
  //       console.log('Kau............', dataKau)
  //       value.push(data._embedded.records)
  //       console.log(data._embedded.records.length, 'Embeded')
  //     })

  //     .catch((error) => console.log(error))
  //   this.setState({ value })

  //   const val = []

  //   doRecursive(`${lastVal}/transactions?limit=100&order=desc`)
  //     .then((data) => {
  //       console.log(data)
  //       val.push(data._embedded.records)
  //       const dataKag = data._embedded?.records.filter((e) => e.memo === this.state.query)
  //       console.log('............', dataKag)
  //       console.log(data._embedded.records.length, 'Embeded')
  //     })
  //     .catch((error) => console.log(error))
  //   this.setState({ val })
  // }

  handleKeypress = (e) => {
    if (e.key === 'Enter') {
      top.location.href = `/search/${this.state.query?.replaceAll('#', '_').replaceAll(' ', '-')}`
    }
  }
  render() {
    const { query } = this.state
    // console.warn(this.state)
    //  console.log(this.props.selectedConnection, 'abc.....')
    // console.log(`/search/${this.state.query}`, 'HELLLOO.........')
    return (
      <div className='field has-addons'>
        <div className='control has-icons-right'>
          <input
            className='input'
            type='text'
            value={this.state.value}
            // value={query}
            onChange={this.handleChange}
            onKeyPress={(e) => this.handleKeypress(e)}
            placeholder='Search...'
          />
          <span className='icon is-right'>
            <i className='fas fa-search' />
          </span>
        </div>
        <div className='control'>
          <Link
            to={`/search/${this.state.query?.replaceAll('#', '_').replaceAll(' ', '-')}`}
            className='button'
            onClick={this.clearInput}
          >
            Search
          </Link>
        </div>
      </div>
    )
  }
}

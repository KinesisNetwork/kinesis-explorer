import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { Connection } from '../../types'
interface State {
  transaction: TransactionRecord | null
  invalidTransaction: boolean
  conn: string | undefined
}
interface OperationProps extends LinkProps {
  selectedConnection: Connection
  disabled? : boolean|string;
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
    disabled: ''
  }
  handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ value: event.currentTarget.value })
    const query = event.target.value
    this.setState({ query: event.target.value, loading: true, message: '' }, () => {
      // console.log("query");
    })
  }
  clearInput: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    this.setState({ value: '', redirectUrl: '/search/memo' })
  }

  handleKeypress = (e) => {
    if (e.key === 'Enter') {
      top.location.href = !this.state.query.replaceAll(' ', '')? '': `/search/${this.state.query?.replaceAll('#', '_').replaceAll(' ', '-')}` 
    }
  }
  render() {
    const { query } = this.state
   
    return (
      <div className='field has-addons'>
        <div className='control has-icons-right'>
          <input
            className='input'
            type='text'
            value={this.state.value}
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
            // to={`/search/${this.state.query?.replaceAll('#', '_').replaceAll(' ', '-')}`}
            to = {!this.state.query.replaceAll(' ', '')? window.location.pathname  : `/search/${this.state.query?.replaceAll('#', '_').replaceAll(' ', '-')}`  }
            className='button'
            // disabled = {!this.state.query.replaceAll(' ', '')?window.location.pathname : !this.state.query }
            onClick={this.clearInput}
          >
            Search
          </Link>
        </div>
      </div>
    )
  }
}

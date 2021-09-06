import { TransactionRecord } from 'js-kinesis-sdk'
import * as React from 'react'
import { Link, Redirect } from 'react-router-dom'
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
    redirect: false,
  }
  handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {

    this.setState({ value: event.currentTarget.value })
    const query = event.target.value
    this.setState({ query: event.target.value, loading: true, message: '' }, () => {
    })

  }
  clearInput: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    this.setState({ value: '', redirect: true })
  }
  handleKeypress = (e) => {
    if (e.key === 'Enter') {
      if (this.state.value.length > 2) {

        top.location.href = !this.state.query.replaceAll(' ', '')
          ? '#'
          : `/search/${this.state.query?.replaceAll('#', '_').replaceAll(' ', '-')}`
        top.location.href = !this.state.value.replaceAll(' ', '')
          ? '#'
          : `/search/${this.state.query?.replaceAll('#', '_').replaceAll(' ', '-')}`
      }
    }
  }
  renderRedirect = () => {
    if (this.state.redirect) {
      this.setState({ value: '', redirect: false })
      return (
        <Redirect
          to={
            !this.state.query
              ? window.location.pathname
              : `/search/${this.state.query?.replaceAll('#', '_').replaceAll(' ', '-')}`
          }
        />
      )
    }
  }
  render() {
    const { query } = this.state
    const enabled =
      this.state.value.length > 2
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
          <button
            className='button'
            disabled={!this.state.query.replaceAll(' ', '') || !enabled}
            onClick={this.clearInput}
          >
            Search
          </button>
          {this.renderRedirect()}
        </div>
      </div>
    )
  }
}

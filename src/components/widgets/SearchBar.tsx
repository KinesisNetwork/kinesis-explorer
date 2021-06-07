import * as React from 'react'
import { Link } from 'react-router-dom'

export class SearchBar extends React.Component {
  state = {
    value: '',
  }

  handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ value: event.currentTarget.value })
    console.log(event.target.value)
  }

  clearInput: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    this.setState(({ value: '' }))
  }
  handleKeypress = (e) => {
    console.log('Eevnttttt', e.key)
    if (e.key === 'Enter') {
      top.location.href = `/search/${this.state.value}`

      }
}

  render() {
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
            to={`/search/${this.state.value}`}
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

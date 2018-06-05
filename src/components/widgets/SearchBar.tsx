import * as React from 'react'
import { Link } from 'react-router-dom'

export class SearchBar extends React.Component {
  state = {
    value: '',
  }

  handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ value: event.currentTarget.value })
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
            placeholder='Search...'
          />
          <span className='icon is-right'>
            <i className='fas fa-search' />
          </span>
        </div>
        <div className='control'>
          <Link to={`/search/${this.state.value}`} className='button is-danger'>
            Search
          </Link>
        </div>
      </div>
    )
  }
}

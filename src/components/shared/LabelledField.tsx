import * as React from 'react'

export interface Props {
  label: string
  value: string | number
  icon?: string
  isLoading?: boolean
  isCompact?: boolean
}

export const LabelledField: React.SFC<Props> = (props) => (
  <div className='field'>
    <label className='label is-small'>{props.label}</label>
    <p className={`control is-expanded ${props.isLoading && 'is-loading'}`}>
      <input className='input is-static' type='text' value={props.value} readOnly={true} />
    </p>
  </div>
)

export const HorizontalLabelledField: React.SFC<Props> = (props) => (
  <div className={`field is-horizontal ${props.isCompact ? 'is-marginless' : ''}`}>
    <div className='field-label is-normal'>
      <label className='label'>{props.label}</label>
    </div>
    <div className='field-body'>
      <div className='field'>
        <div className={`control is-expanded ${props.isLoading ? 'is-loading' : ''}`}>
          <p className='input is-static'>{props.value}</p>
        </div>
      </div>
    </div>
  </div>
)

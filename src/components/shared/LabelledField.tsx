import * as React from 'react'

export interface Props {
  label: string
  value: string | number | React.ReactNode
  icon?: string
  isLoading?: boolean
  isCompact?: boolean
  wideLabel?: boolean
  tag?: string
}

export const LabelledField: React.SFC<Props> = (props) => (
  <div className='field'>
    <label className='label is-small'>{props.label}</label>
    <p
      className={`control is-expanded ${
        props.isLoading ? 'is-loading-blur' : ''
      }`}
    >
      <p className='input is-static'>{props.value}</p>
    </p>
  </div>
)

export const HorizontalLabelledField: React.SFC<Props> = (props) => (
  <div className='field is-horizontal is-marginless'>
    <div
      className='field-label is-normal'
      style={props.wideLabel ? { flexGrow: 3 } : {}}
    >
      <label className='label'>{props.label}</label>
    </div>
    <div className={`field-body ${props.isLoading ? 'is-loading-blur' : ''}`}>
      <div className='field'>
        <div className={`control is-expanded`}>
          <p className='input is-static'>{props.value}</p>
        </div>
      </div>
      {props.tag && (
        <span className='tag is-info is-medium' style={{ height: '100%' }}>
          {props.tag}
        </span>
      )}
    </div>
  </div>
)

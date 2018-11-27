import React from 'react'
import Cell from '../cell'
import './style.scss'

export default class FormCell extends React.PureComponent {
  render() {
    const props = this.props
    return (
      <Cell
        className={'form-cell ' + (props.className || '')}
        title={
          <Cell
            title={props.titleFixed}
            value={props.title}
          />
         /* <React.Fragment>
            <span>{props.titleFixed}</span>
            <span>{props.title}</span>
          </React.Fragment>*/
        }
        value={
          <Cell
            title={props.value}
            value={props.valueFixed}
          />
        }
      />
    )
  }
}

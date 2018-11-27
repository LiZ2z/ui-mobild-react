import React from 'react'
import Cell from '../cell'
import './style.scss'

class FormCell extends React.PureComponent {
  render() {
    const props = this.props
    return (
      <Cell
        className={'form-cell'}
        title={
          <React.Fragment>
            <span>{props.titleFixed}</span>
            <span>{props.title}</span>
          </React.Fragment>
        }
        value={
          <React.Fragment>
            <span>{props.value}</span>
            <span>{props.valueFixed}</span>
          </React.Fragment>
        }
      />
    )
  }
}

export default FormCell
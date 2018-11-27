import React from 'react'
import PropTypes from 'prop-types'
import './cell.scss'
/**
 * @component {comp} Cell 一个响应式布局
 * 
 * @prop {string} className
 * @prop {number} titleWidth
 * @prop {string} titleAlign
 * @prop {string} title
 * @prop {string} value
 * 
 */
class Cell extends React.PureComponent {
  render() {
    const props = this.props

    return (
      <div className={'cell' + (props.className ? (' ' + props.className) : '') + (props.reverse ? ' reverse':'')}>
        {
          props.title && (
            <div className="cell-title"
              style={{
                width: props.titleWidth,
                textAlign: props.titleAlign
              }}
            >
              {props.title}
            </div>
          )
        }
        {props.value && <div className="cell-value">{props.value}</div>}
      </div>
    )
  }
}

Cell.defaultProps = {
  titleWidth: null,
  titleAlign: 'left',
  reverse: false
}

Cell.propTypes = {
  textAlign: PropTypes.oneOf(['left', 'right', 'center']),
  titleWidth: PropTypes.number,
}

export default Cell

import React from 'react'

class SwipeItem extends React.PureComponent {
  render() {
    const props = this.props
    return (
      <div className={'u-swipe__item'} style={{transform: `translate${props.axis}(${props.offset}px)`}}>
        {props.children}
      </div>
    )
  }
}

export default SwipeItem
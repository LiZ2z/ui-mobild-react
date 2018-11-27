import React from 'react'
import createSlide from '../slide'
import PropTypes from 'prop-types'

const BTN_WIDTH = 90
const MIN_WIDTH = 40

/**
 * @prop {array} left  left = [
 *  {
 *    content: '删除',
 *    onClick: () => {},
 *    style: {},
 *    background: 'red'
 *  }
 * ]
 * @prop {array} right right = 同上
 *
 * */
class Slide extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      right: 0,
      needAnimation: false
    }
    this.isOn = 0
    this.container = {current: null}

    this.reset = this.reset.bind(this)
    this.analyse = this.analyse.bind(this)
  }
  componentDidMount() {
    this.detachEvent = createSlide({
      el: this.container.current,
      onStart: this.handleStart.bind(this),
      onMove: this.handleMove.bind(this),
      onEnd: this.handleEnd.bind(this),
      axis: 'X'
    })
    document.addEventListener('touchstart', this.analyse)
  }
  componentWillUnmount() {
    this.detachEvent()
    document.removeEventListener('touchstart', this.analyse)
  }
  analyse(e) {
    if(this.container.current.contains(e.target)) return
    this.reset()
  }
  reset() {
    this.isOn = 0
    this.setState({right:0, needAnimation: true})
  }

  /**
   * @function - touchStart
   * */
  handleStart() {
    this.setState({
      needAnimation: false,
    })
  }
  /**
   * @function - touchMove
   * */
  handleMove(obj, e) {
    const touch = obj.touches[0]
    if(touch.axis === 'Y') {
      e.stopPropagation()
      // e.preventDefault()
      return
    }
    e.preventDefault()
    let right = this.isOn + (touch.diffX * -touch.direction)

    if(right < 0) right = 0
    this.setState({ right: right })
  }
  /**
   * @function - touchEnd
   * */
  handleEnd(obj) {
    const touch = obj.prevTouches[0]
    let right = 0
    const min = (BTN_WIDTH * this.props.left.length)
    const diffTime = obj.endTimestamp - touch.startTimestamp

    if(touch.diffX/diffTime > 0.2) {
      right = touch.direction > 0 ? 0 : min
    } else if(touch.direction < 0 && MIN_WIDTH < this.state.right) {
      right = min
    }

    this.isOn = right
    this.setState({
      right: right,
      needAnimation: true,
    })
  }

  render() {
    const state = this.state
    const props = this.props
    const animation = state.needAnimation ? ' animation' : ''
    return (
      <div className={'u-slide-container ' + (props.className || '')} ref={this.container}>

        <div className={'u-slide-track'+ animation }
             style={{transform: `translate3d(${-state.right}px, 0, 0)`}}
        >
          {this.props.children}
        </div>

        {
          props.left.length > 0 && (
            <div className={'u-slide-btns-wrap__right'+ animation}
                 style={{width: state.right <=0 ? 0 : state.right }}
            >
              {
                props.left.map((item,i) => {
                  const style = Object.assign({width: BTN_WIDTH, background: item.background}, item.style)
                  return (<div key={i} className={'u-slide-btn'} style={style} onClick={item.onClick||null}>{item.content}</div>)
                })
              }
            </div>
          )
        }

      </div>
    )
  }
}

Slide.propTypes = {
  left: PropTypes.array,
  right: PropTypes.array
}

Slide.defaultProps = {
  left: [],
  right: []
}

export default Slide;
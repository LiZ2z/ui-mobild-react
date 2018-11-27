import React from 'react'
import PropTypes from 'prop-types'
import * as Slide from '../slide'

let swipeQueue = []

class Swipe extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      current: props.hasOwnProperty('current') ? props.current : props.initIndex,    // 当前索引
      style: {},
      distance: 0,
      duration: props.transitionWhenPropsChange ? props.duration : 0
    }
    this.el = {current: null}
    this.itemSize = 0

    this.firstChildOffset = 0
    this.lastChildOffset = 0

    this.didMove = false


    if(props.id) {
      swipeQueue.push({
        id: props.id,
        resize: this.resize.bind(this)
      })
    }

  }
  /**
   * @function - 监听事件
   * */
  componentDidMount(){
    this.detachEvent = Slide.default({
      el: this.el.current,
      onMove: this.handleMove.bind(this),
      onEnd: this.handleEnd.bind(this),
      axis: this.props.axis
    })


    this.initialize(this.props)
  }
  /**
   * 取消事件监听， 取消一切绑定
   *
   * */
  componentWillUnmount() {
    this.detachEvent && this.detachEvent()
    clearTimeout( this.timer )

    for(let i=0, len = swipeQueue.length; i < len; i++) {
      if(swipeQueue[i].id === this.props.id) {
        swipeQueue.splice(i, 1)
        return
      }
    }
  }
  /**
   * @function - 响应props变化
   *
   * */
  UNSAFE_componentWillReceiveProps(nextP){
    const state = this.state
    const nC = nextP.current
    if((this.props.current !== nC && nC !== state.current) || state.distance !== 0) {
      this.isPropsChange = true
      this.setState({
        distance: 0,
        current: nC,
        duration: nextP.transitionWhenPropsChange ? nextP.duration : 0
      })
    }
  }
  /**
   * 切换完成后， 如果用户监听了changeEnd事件， 触发onChangeEnd
   * */
  componentDidUpdate(prevP, prevS) {
    clearTimeout( this.timer )
    if(!this.props.onChangeEnd) return
    const props = this.props
    const current = this.state.current
    // 判断swipe是否发生了滑动
    if(prevS.current !== current) {
      // 判断是自身发生的滑动， 还是接收到的来自父组件的props.current而产生的滑动
      // 据此，判断duration时间
      const duration = (props.current !== prevP.current )
        ? (props.transitionWhenPropsChange ? props.duration : 0)
        : props.duration

      this.timer = setTimeout(()=> {
        this.props.onChangeEnd(current)
      },duration)
    }
  }

  /**
   * Swipe外部容器 resize后， 调用Swipe.resize('swipe的id')
   * 否则不能正常工作
   * */
  resize() {
    this.initialize(this.props)
  }
  /**
   * @function - 初始化
   * 获取swipe宽度、 children数量
   * */
  initialize(props) {
    const {axis, children} = props
    const el = this.el.current

    this.itemSize = axis === Slide.X ? el.clientWidth : el.clientHeight
    this.count = children.length
    this.forceUpdate()
  }


  handleMove(obj, e) {
    e.stopPropagation()
    const touch = obj.touches[0]
    const axis = this.props.axis
    if(touch.axis !== axis) return // 滑动的轴向跟设定的不一致，阻止
    e.preventDefault() //滑动时阻止默认事件

    this.didMove = true
    this.props.onMoving()
    this.setState({
      distance: touch['diff'+axis] * touch.direction,
      duration: 0,
    })
  }

  /*
  * 手指离开屏幕时，在Swipe元素外触发 touchEnd, 会触发此函数
  * */
  handleEnd(obj, e) {
    if(this.props.stopPropagation) e.stopPropagation()

    if(!this.didMove) return
    this.didMove = false

    const touch = obj.prevTouches[0]
    const props = this.props
    const dist = touch['diff'+props.axis]
    const timeDiff = obj.endTimestamp - touch.startTimestamp
    const dirct = touch.direction
    let current = this.state.current
    // 如果不需要循环， 则滑动到最后一个，之后不能继续左滑动
    // 或到第一个不能继续右滑
    let doNot = false
    if(!props.loop) {
      if(((current === (this.count - 1)) && dirct < 0) || (current === 0 && dirct > 0)) {
        doNot = true
        current = current
      }
    }

    if(!doNot && ((timeDiff < 200 && dist > 0) || dist > 100)) {
      current += dist*dirct > 0 ? -1 : 1
    }

    // if(!this.isPropsChange) {
    //
    // }
    props.onChange(current)

    // shouldDisableSelfUpdate
    if(props.hasOwnProperty('current')) return

    this.setState({
      current: current,
      distance: 0,
      duration: props.duration,
    })
  }


  /**
   * @function - 循环
   * */
  loop(d) {
    const state = this.state
    const count = this.count
    const current = state.current

    this.firstChildOffset = this.lastChildOffset = 0
    if (d < 0) {
      if (current === count || current === 0) {
        this.firstChildOffset = count*this.itemSize
      }
    } else {
      if (current === 1 || current === count + 1) {
        this.lastChildOffset =  -count*this.itemSize
      }
    }

    this.setState({
      current: (current > count ? 1 : current < 1 ? count : current),
    })

  }
  render() {
    const props = this.props
    const state = this.state
    const current = state.current
    const count = this.count
    const dist = -this.itemSize* current + state.distance
    const style = {
      transform: `translate3d(${props.axis ==='X'? (dist+'px,0'):('0,'+dist+'px')}, 0)`,
      transitionDuration : `${state.duration}ms`
    }
    const cN = props.className

    return (
      <div className={`u-swipe__container${(props.axis === Slide.X ? ' _horizontal':'')}${cN ? (' '+cN) :''}`}
           ref={this.el}
      >
        <div className="u-swipe__track" style={style}>
          {
            props.children.map((child, i) => (
              React.cloneElement(child, Object.assign({},child.props, {
                key: i,
                axis: props.axis,
                offset: i === 0 ? this.firstChildOffset : (i === count - 1 ? this.lastChildOffset: 0)
              }))
            ))
          }
        </div>

        {
          props.render && props.render(current, count)
        }
      </div>
    )
  }
}

Swipe.defaultProps = {
  axis: Slide.X,   // X轴 | Y轴 轮播
  duration: 300,   //过渡时的缓动时间
  indicator: true, // 是否需要指示器
  loop: false,      // 是否需要循环
  auto: 2000,      // 轮播停留时间
  disableTouch: false,  // 禁止手动滑动轮播
  transitionWhenPropsChange: false, // 当通过父组件改变props.current时, 是否需要过渡效果
  onChange: ()=>{},
  initIndex: 0,
  stopPropagation: true,
  onMoving: () => {},
  // onChangeEnd: ()=>{},
  // current: 0,      // 当前页, 以 0 开始
  // render  props render
}

Swipe.propTypes = {
  axis: PropTypes.oneOf([Slide.X, Slide.Y]),
  duration: PropTypes.number,
  indicator: PropTypes.bool,
  current: PropTypes.number,
  initIndex: PropTypes.number,
  loop: PropTypes.bool,
  auto: PropTypes.number,
  disableTouch: PropTypes.bool,
  transitionWhenPropsChange: PropTypes.bool,
  render: PropTypes.func
}

/**
 * @function - 重新设置swipe 尺寸
 * */
Swipe.resize = function(id) {
  if(id) {
    for(let i=0, len = swipeQueue.length; i < len; i++) {
      if(swipeQueue[i].id === id) {
        swipeQueue[i].resize()
        return
      }
    }
  }
  else{
    swipeQueue.forEach(item=>item.resize())
  }
}

export default Swipe
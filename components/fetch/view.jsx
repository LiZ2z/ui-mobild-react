import React from 'react'
import createSlide from '../slide'
import Loading from '../loading'

const maxDistance = 35
const duration = 300
const INFINITY_REFRESH_MIN_DIST = 45 // 滚动加载 距离底部  触发距离


/* 手指触摸的状态 */
const START = 'START'
const MOVING = 'MOVING'

/* 触发类型 */
const IS_INFINITE = 'I_IF' // 滚动加载
const IS_REFRESH = 'P_R'   // 下拉加载

/* 下拉状态显示 */
const PULLING = 'PULLING'  //正在下拉
const IS_MAX = 'I_M'       //已到达最小触发点
/* 上滑无限加载 */
const ALL_LOADED = 'A_L'
/* 通用状态 */
const FETCHING = 'FT'      //正在请求
const DONE = 'DONE'        //完成

let fetchQueue = []


/**
 *
 * @prop {function} onFetch  开始请求
 * @prop {object} style
 * @prop {boolean} disableRefresh 禁用下拉刷新
 * @prop {boolean} disableScroll  禁用滚动加载
 * @prop {boolean} stopPropagation 阻止滚动事件冒泡
 * @prop {el} scrollElement 滚动的元素
 *
 * */
// const div = document.body.appendChild(document.createElement('div'))
// div.setAttribute('style', 'position:fixed;bottom:0;right:0;z-index: 999999;background:#ccc;color:#000;overflow:scroll')

class Fetch extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      distance: 0,              // track 元素滑动距离
      needAnimation: false,     // track 元素滑动是否需要动画效果
      pullRefreshStatus: DONE,      // 下拉加载 的 状态
      scrollFetchStatus: DONE,       // 滚动加载 的 状态
      // needShadow: false
    }
    this.touchStatus = DONE   // 手指触摸状态
    this.wrapEl = {current: null}  //
    this.fetchState = null    // 加载状态 ?  下拉刷新 | 无限滚动
    this.promiseReject = null
    /* ------  */
    this.slideObj = null
    this.isStateFrozen = false

    if (props.id) {
      fetchQueue.push({
        id: props.id,
        clearState: this.clearState.bind(this)
      })
    }


    /* ----- -*/
    this.handleScroll = this.handleScroll.bind(this)
  }

  /**
   * @function - 下拉加载, 监听指定元素的touch事件
   * */
  componentDidMount() {
    if (this.props.hasOwnProperty('scrollElement')) {
      const ref = this.props.scrollElement
      if (typeof ref === 'function') {
        ref(this.wrapEl.current)
      } else if (ref && typeof ref === 'object' && ref.current) {
        ref.current = this.wrapEl.current
      }
    }

    if (!this.props.disableRefresh)
      this.attachEvent()
  }


  /**
   * @function - 下拉加载, 取消监听元素的touch事件
   * */
  componentWillUnmount() {
    this.detachEvent && this.detachEvent()

    for (let i = 0, len = fetchQueue.length; i < len; i++) {
      if (fetchQueue[i].id === this.props.id) {
        fetchQueue.splice(i, 1)
        return
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextP) {
    if (nextP.disableRefresh !== this.props.disableRefresh) {
      if (nextP.disableRefresh) {
        this.detachEvent && this.detachEvent()
      } else {
        this.attachEvent()
      }
    }

  }

  attachEvent() {
    this.detachEvent && this.detachEvent()
    this.detachEvent = createSlide({
      el: this.wrapEl.current,
      onStart: this.handleStart.bind(this),
      onMove: this.handleMove.bind(this),
      onEnd: this.handleEnd.bind(this),
      axis: 'Y',
    })
  }

  clearState() {
    if (this.promiseReject) {
      this.promiseReject()
    }
    this.touchStatus = DONE   // 手指触摸状态
    this.fetchState = null    // 加载状态 ?  下拉刷新 | 无限滚动
    this.promiseReject = null
    this.slideObj = null
    this.isStateFrozen = false
    // 重置时， 底部提示消失， 会触发 wrapEl 的滚动事件
    // 引发多余的请求

    this.wrapEl.current.scrollTop = 0

    this.setState({
      distance: 0,
      needAnimation: true,
      pullRefreshStatus: DONE,
      scrollFetchStatus: DONE
    })
  }

  /**
   * @function - 下拉加载, touchstart事件处理
   * */
  handleStart() {
    if (this.isStateFrozen || this.props.disableRefresh) return    // 如果此时加载完成, 元素正在归位, 禁止滑动
    this.touchStatus = (this.wrapEl.current.scrollTop === 0) ? START : DONE
  }

  /**
   * @function - 下拉加载, touchmove事件处理
   * */
  handleMove(obj, e) {
    const touch = obj.touches[0]
    if (touch.axis === 'X') return
    // 1. 只有在最顶部时,才允许
    if ((this.touchStatus !== START && this.touchStatus !== MOVING) || this.isStateFrozen) return
    // 2. 如果在最顶部, 但是 不是往下拉, 流程无效
    if (this.touchStatus === START && touch.direction < 0) {
      this.touchStatus = DONE
      return
    }
    this.touchStatus = MOVING
    // 4. 阻止默认事件，在ios上整个网页会被拉下来
    e.preventDefault()

    const isFetching = this.state.pullRefreshStatus === FETCHING

    // 5. 设置下拉 距离
    let diff = ((touch.direction * touch.diffY) < 0 ? 0 : touch.diffY) / 4 //越大，粘滞感越强
    if (isFetching) {
      diff += maxDistance
    }

    this.setState({
      distance: diff,
      needAnimation: false,
      pullRefreshStatus: isFetching ? FETCHING : (diff < maxDistance ? PULLING : IS_MAX)
    })
  }

  /**
   * @function - 下拉加载, touchend事件处理
   * */
  handleEnd() {
    if (this.touchStatus !== MOVING || this.isStateFrozen) return
    this.touchStatus = DONE

    const step = this.state.pullRefreshStatus
    const isMax = step === IS_MAX
    const isFetching = step === FETCHING

    this.setState({
      distance: (isMax || isFetching) ? maxDistance : 0,
      pullRefreshStatus: (isMax || isFetching) ? FETCHING : DONE,
      needAnimation: true,
    })

    // 当拉到最大位置, 且此时没有在请求数据时才执行
    if (!isMax) return

    this.fetch(IS_REFRESH)
  }

  /**
   * @function - 滚动加载, 监听滚动
   * */
  handleScroll(e) {
    if (this.props.stopPropagation) e.stopPropagation() // 防止嵌套Fetch 问题
    const el = e.target
    const scrollTop = el.scrollTop
    //
    // // 产生滚动后给个阴影提示
    // const needShadow = scrollTop !== 0
    // if (needShadow !== this.state.needShadow) {
    //   this.setState({needShadow: needShadow})
    // }

    if(scrollTop <= 0) {
      // e.stopPropagation()
      // e.preventDefault()
      return
    }

    // 被父组件禁用 或 在顶部 不触发
    if (this.props.disableScroll ) return

    // 没滚到位置， 不触发
    if (el.scrollHeight - (scrollTop + el.clientHeight) > INFINITY_REFRESH_MIN_DIST) return

    const state = this.state.scrollFetchStatus

    // 数据全部加载完了 或  正在加载的时候  不再多次触发
    if (state === ALL_LOADED || state === FETCHING) return

    this.setState({scrollFetchStatus: FETCHING})
    this.fetch(IS_INFINITE)
  }

  /**
   * @function - 通知外部进行请求
   * */
  fetch(type) {
    // 如果正在请求, 之后的触发都无效, 知道请求完成
    // 但如果两次的请求类型不同, 则继续
    if (this.isFetching && this.fetchState === type) return
    this.fetchState = type
    this.isFetching = true

    // reject上次的Promise
    if (this.promiseReject) {
      this.promiseReject()
      this.promiseReject = null
    }

    new Promise((resolve, reject) => {
      this.promiseReject = reject
      const fn = this.props.onFetch
      fn ? fn(resolve, type) : resolve()
    })
      .then((hasAllLoaded) => {// 重置状态
        this.isFetching = false
        this.setState({
          distance: 0,
          pullRefreshStatus: DONE,
          needAnimation: true,
          scrollFetchStatus: hasAllLoaded ? ALL_LOADED : DONE
        })
      })
      .catch(err => {
      })
  }


  /**
   * @function - 下拉刷新完成, 归位
   * */
  componentDidUpdate(prevS) {
    const current = this.state.pullRefreshStatus
    if (prevS.pullRefreshStatus !== current && current === DONE) {
      // 下拉刷新， 完成后， fetch归位的时候， 不允许操作
      this.isStateFrozen = true
      setTimeout(() => {
        this.isStateFrozen = false
        this.touchStatus = DONE
      }, duration)
    }
  }

  render() {
    const state = this.state
    const props = this.props
    const animation = state.needAnimation ? ' animation' : ''
    const S_S = state.scrollFetchStatus
    const P_S = state.pullRefreshStatus
    const pN = props.className
    return (
      <div className={'u-fetch-container' + (pN ? (' ' + pN) : '')}>
        <div ref={this.wrapEl}
             style={props.style || null}
             onScroll={this.handleScroll}
             className={'u-fetch-container__sub'}
        >
          {/* 下拉加载 */}
          <div className={'__loading__wrap _top' + animation}
               style={{transform: `translate3d(0,${state.distance}px,0)`}}
          >
            <div className='__loading-text'>
              {
                P_S === FETCHING ? <div>正在加载<Loading className={'u-fetch-loading-icon'}/></div>
                  : P_S === IS_MAX ? '放手吧'//(๑´ㅂ`๑)
                  : '下拉刷新'
              }
            </div>
          </div>
          {/* 内容 */}
          <div className={'u-fetch-track' + animation}
               style={{transform: `translate3d(0,${state.distance}px,0)`}}
          >
            {this.props.children}
            {/* 上滑无限加载 */}
            {
              S_S !== DONE && (
                <div className='__loading-text _bottom'>
                  {
                    S_S === FETCHING ? <span>正在加载<Loading className={'u-fetch-loading-icon'}/></span>
                      : S_S === ALL_LOADED ? '已经没有啦'// ٩(͡๏̯͡๏)۶
                      : null
                  }
                </div>
              )
            }
          </div>
        </div>
      </div>
    )
  }
}


Fetch.defaultProps = {
  disableRefresh: false,
  disableScroll: false,
  stopPropagation: true
}


Fetch.isInfinite = () => IS_INFINITE
Fetch.isRefresh = () => IS_REFRESH

/**
 * @function - 清楚Fetch状态
 * */
Fetch.clearState = function (id) {
  if (id) {
    for (let i = 0, len = fetchQueue.length; i < len; i++) {
      if (fetchQueue[i].id === id) {
        fetchQueue[i].clearState()
        return
      }
    }
  }
  else {
    fetchQueue.forEach(item => item.clearState())
  }
}


export default Fetch
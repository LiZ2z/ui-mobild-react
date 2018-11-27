import React, {Component} from 'react'
import createSlide from '../../slide'
import './style.scss'

const zoomQueue = []

// const div = document.body.appendChild(document.createElement('div'))
// div.setAttribute('style', 'position:fixed;top:0;left:0;z-index: 99999;background:#ccc;color:#000;')
//
// const div2 = document.body.appendChild(document.createElement('div'))
// div2.setAttribute('style', 'position:fixed;bottom:0;left:0;z-index: 99999;background:#ccc;color:#000;')

const MOVING = 'MOVING'
const ZOOMING = 'ZOOMING'
const NONE = 'NONE'

class Zoom extends Component {
  constructor(props) {
    super(props)
    const obj = {
      scale: 1,   // 缩放比例
      transX: 0,  // translate 左右偏移
      transY: 0,   // translate 上下偏移
    }
    this.state = Object.assign({duration: 0}, obj)

    this.cache = obj          // 记录元素上次的transform信息

    this.rect = {}                // 记录内部元素rect信息
    this.target = {current: null} // 获取内部元素，以获取信息

    this.wrap = {current: null}   // 获取外部元素，以添加事件


    if(props.id || props.id === 0) {
      zoomQueue.push({
        id: props.id,
        reset: this.reset.bind(this)
      })
    }

  }
  reset() {
    const obj = {
      scale: 1,   // 缩放比例
      transX: 0,  // translate 左右偏移
      transY: 0,   // translate 上下偏移
    }
    this.cache = obj
    this.status = NONE
    this.setState(Object.assign({duration: 0}, obj))
  }
  addEvent() {
    this.detachEvent = createSlide({
      el: this.wrap.current,
      onMove: this.handleMove.bind(this),
      onEnd: this.handleEnd.bind(this),
    })
  }
  /**
   * 获取元素宽高、添加事件
   */
  componentDidMount() {
    setTimeout(() => {
      this.rect = this.target.current.getBoundingClientRect()
    }, 34)
    // 因为此元素宽高靠内部图片支撑,如果直接使用网络图片,
    // 图片加载较慢会导致获取不到正确的宽高
    if(!this.props.disabled) this.addEvent()

  }
  /**
   * @function - 随着props启动Zoom
   * @param {*} nextP
   */
  UNSAFE_componentWillReceiveProps(nextP) {

    if(nextP.disabled !== this.props.disabled) {
      if(nextP.disabled) {
        this.detachEvent && this.detachEvent()
        this.reset()
      } else {
        this.addEvent()
      }
    }
  }
  /**
   * @function - 卸载， 删除事件监听，从queue中删除
   *
   */
  componentWillUnmount() {
    this.slideObj && this.slideObj.detachEvent()

    if(this.props.id) {
      for(let i=0, len = zoomQueue.length; i < len; i++) {
        if(zoomQueue[i].id === this.props.id) {
          zoomQueue.splice(i, 1)
          return
        }
      }
    }

  }

  handleMove(obj, e) {
    e.preventDefault()
    //单指
    if (obj.numberOfTouches === 1) {
      const touch = obj.touches[0]
      // 单指滑动，
      //如果 滑动的图片的边缘就阻止滑动，启动外层的轮播组件
      //否则，滑动图片
      if(
        touch.axis === 'X' && (
          this.cache.scale === 1
          ||(this.leftToTheEnd && touch.direction > 0)
          || (this.rightToTheEnd && touch.direction < 0)
        )
      ) {
        // 滑动到边缘了，直接return, 只要不执行到下面的 e.stopPropagation()
        // 滑动事件不被阻止冒泡， 就会触发swipe滑动
        return
      } else {
        this.leftToTheEnd = false
        this.rightToTheEnd = false
      }

      if(this.cache.scale === 1) return
      this.status = MOVING
      e.stopPropagation()
      this.movePicture(touch, e)
    }
    // 双指
    else {
      e.stopPropagation()
      this.zoomPicture(obj)
    }

  }


  handleEnd(obj,e) {
    // 单指移动
    if (obj.numberOfTouches + obj.numberOfChanged <= 1) {
      if (this.status === MOVING) {
        this.status = NONE
        this.movePictureEnd()
      }
      return
    }

    this.zoomPictureEnd(obj)
  }


  /**
   * @function - 移动
   * */
  movePicture(obj) {
    const cache = this.cache
    // div.innerHTML = (
    //   `
    //   <p style='width:100%;word-break:break-all;'>缓存：${JSON.stringify(cache)}</p>
    //   <p style='width:100%;word-break:break-all;'>移动obj：${JSON.stringify(obj)}</p>
    //   `
    // )

    this.setState({
      transX: ((obj.diffX * obj.directionX) - cache.transX) / cache.scale,
      transY: ((obj.diffY * obj.directionY) - cache.transY) / cache.scale,
      duration: 0
    })

  }
  /**
   * @function - 移动结束， 如果图片超出， 归位图片
   *
   * */
  movePictureEnd() {
    const state = this.state
    const scale = state.scale
    const rect = this.rect
    let tX = state.transX
    let tY = state.transY

    const offsetLeft = rect.left + tX * scale - rect.width * this.props.index

    if (offsetLeft > 0) {
      this.leftToTheEnd = true
      tX = tX - offsetLeft / scale
    }
    const offsetRight = (rect.width - offsetLeft) - rect.width * scale
    if (offsetRight > 0) {
      this.rightToTheEnd = true
      tX = tX + offsetRight / scale
    }

    const offsetTop = rect.top + tY * scale

    if (offsetTop > 0) {
      tY = tY - offsetTop / scale
    }
    const offsetBottom = (rect.height - offsetTop) - rect.height * scale
    if (offsetBottom > 0) {
      tY = tY + offsetBottom / scale
    }


    this.setState({
      transX: tX,
      transY: tY,
      duration: 100,
    }, () => {
      this.props.onChange(Object.assign({}, this.state))
    })

    this.cache = Object.assign({}, this.cache, {
      transX: -tX * scale,
      transY: -tY * scale
    })
  }


  zoomPicture(obj) {
    const multiple = obj.multiple
    // 180 常量，
    let scale = (multiple.diffSpaceBetween / 180) + this.cache.scale

    if(scale < 1) {
      scale = (multiple.diffSpaceBetween / (180 + (1-scale) * 200)) + this.cache.scale
    }

    this.computeZoomStyle(scale, [multiple.startX, multiple.startY])
  }

  zoomPictureEnd(obj) {
    const multiple = obj.prevMultiple

    let currentScale = this.state.scale

    currentScale = currentScale > 3 ? 3 : currentScale


    if(currentScale < 1) {
      this.props.onChange(Object.assign({}, this.state))
      this.props.onClose()
      return
    }


    this.computeZoomStyle(currentScale, [multiple.startX, multiple.startY], true)
      .then(([w, h]) => {

        this.cache.scale = currentScale
        this.cache.transX = w
        this.cache.transY = h
        this.cache = Object.assign({}, this.cache, {
          scale: currentScale,
          transX: w,
          transY: h,
          touchX: multiple.currentX,
          touchY: multiple.currentY
        })

        this.props.onChange(Object.assign({}, this.state))
      })
  }

  computeZoomStyle(scale, arr, needDuration) {
    return new Promise((resolve) => {

      const rect = this.rect
      const x = arr[0] - rect.left + rect.width * this.props.index
      const y = arr[1] - rect.top
      const [w,h] = this.computeZoomTranslate(scale, x, y)

      this.setState({
        scale: scale,
        transX: -w / scale,
        transY: -h / scale,
        duration: needDuration ? 300 : 0
      }, () => resolve([w, h]))
      // resolve必须要传数组，因为，resolve只能接受一个参数，故将多个数据以数组传递
    })
  }
  /**
   * @function - 计算偏移量，缩放的同时，保持缩放点固定
   *
   * @param {number} currentScale
   * @param {number} x
   * @param {number} y
   */
  computeZoomTranslate(currentScale, x, y) {
    const {scale: lastScale, transX, transY} = this.cache

    return [
      (currentScale / lastScale - 1) * (transX + x) + transX,
      (currentScale / lastScale - 1) * (transY + y) + transY
    ]

  }
  render() {
    const state = this.state

    // div2.innerHTML = (
    //   `
    //   <p>缩放：${state.scale}</p>
    //   <p>X轴偏移：${state.transX}</p>
    //   <p>Y轴偏移：${state.transY}</p>
    //   <p>duration：${state.duration}</p>
    //   `
    // )
    return (
      <div
        className={'u-zoom'}
        ref={this.wrap}
      >
        <div className="u-zoom__track"
             ref={this.target}
             style={{
               transform: `scale(${state.scale}, ${state.scale}) translate3d(${state.transX}px, ${state.transY}px, 0)`,
               transitionDuration: state.duration + 'ms',
             }}
        >
            {this.props.children}
        </div>
      </div>
    )
  }
}

Zoom.defaultProps = {
  onChange: () => {},
  onClose: ()=> {},
  index: 0,
  disabled: false,
}


Zoom.clearState = function (id) {
  if(id || id === 0) {
    zoomQueue.filter(item=> item.id === id)[0].reset()
    return
  }
  zoomQueue.forEach(item => item.reset())
}

export default Zoom
import React from 'react'
import portal from '../portal'
import Swipe from '../swipe'
import Icon from '../icon'
import Zoom from './touch-zoom'

/**
 * @Component 预览组件主要部分
 *
 * @prop {number} index
 * @prop {boolean} visible
 * @prop {number} duration
 * @prop {array} imgs
 * */
class PreviewModal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      img: null,      //初始化时显示的图片
      position: null, //位置
      isZoom: true,   //正在打开或关闭
      isZoomDisabled: false
    }

    this.current = props.index
    this.cache = {}
    this.close = this.close.bind(this)
    this.onZoomChange = this.onZoomChange.bind(this)
    this.onSwipeChange = this.onSwipeChange.bind(this)
    this.onSwipeMoving = this.onSwipeMoving.bind(this)
  }

  UNSAFE_componentWillReceiveProps(nextP) {
    if (nextP.visible === this.props.visible) return

    this.current = nextP.index

    const newState = Object.assign({}, {
      img: nextP.imgs[nextP.index],
      isZoom: true,
    }, this.setPosition(nextP))

    this.setState( newState, () => {
      if(!nextP.visible) return
      // 显示后取消样式, 以显示过渡效果
      setTimeout(() => {
        this.setState({
          position: { transitionDuration: nextP.duration + 'ms' }
        })
        // 完全显示后, swipe 重新计算宽度
        setTimeout(() => {
          this.setState({isZoom: false})
        }, nextP.duration)

      }, 10)
    })
  }



  close() {
    const props = this.props
    this.setState({
      isZoom: true,
      img: props.imgs[this.current],
      position: {
        transform: `${this.cache.scale <= 1 ? '': `translate(${-this.cache.transX/this.cache.scale}px, ${-this.cache.transY/this.cache.scale}px)`} scale(${this.cache.scale})`,
        transitionDuration: 0
      }
    },() => {
      setTimeout(() => {
        this.setState(this.setPosition(this.props, true))
        setTimeout(this.props.onClose, props.duration)
      }, 10)
    })
  }

  onSwipeChange(index) {

    if(this.current !== index) {
      Zoom.clearState(this.current)
    }
    this.current = index
    // this.forceUpdate()
    this.setState({
      isZoomDisabled: false
    })
  }
  onSwipeMoving() {
    if(this.state.isZoomDisabled) return
    this.setState({ isZoomDisabled: true})
  }
  /**
   * @function - zoom改变，记录zoom缩放
   * */
  onZoomChange(obj) {
    this.cache = obj
  }

  setPosition(props, isClose) {
    const index = isClose ? this.current : props.index
    const obj = props.imgs[index]
    if(!obj || !obj.el) return {
      position: {
        width: 0,
        height: 0,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%) scale(1)',
        transitionDuration: props.duration + 'ms'
      }
    }
    const position = obj.el.getBoundingClientRect()
    return {
      position: {
        width: position.width,
        height: position.height,
        top: position.top,
        left: position.left,
        transform: 'translate(0,0) scale(1)',
        transitionDuration: props.duration + 'ms'
      }
    }
  }

  render() {
    const state = this.state
    const props = this.props
    return (
      props.visible && (
        <div className={'u-preview__container'}>
          <Icon className={'close u-preview__close-btn'} onClick={this.close}/>
          {
            !state.isZoom && (
              <Swipe
                onChangeEnd={this.onSwipeChange}
                onMoving={this.onSwipeMoving}
                initIndex={props.index}
                stopPropagation={false}
                render={(index, total) => (
                  <div className={'u-preview-swipe-tip-bar'}>
                    <span className={'u-preview-swipe-indicator'}>{index+1}/{total}</span>
                  </div>
                )}
              >
                {
                  props.imgs.map((img, i) => (
                    <Swipe.Item key={i}>
                      <div className={'u-preview__swipe-item'}>
                        <Zoom disabled={this.current !== i || this.state.isZoomDisabled}
                              index={i - props.index}
                              id={i}
                              onChange={this.onZoomChange}
                              onClose={this.close}
                        >
                          <img className={'u-preview__modal-img'} src={img.src} />
                        </Zoom>
                      </div>
                    </Swipe.Item>
                  ))
                }
              </Swipe>
            )
          }
          {
            state.isZoom && state.img && (
              <div className={'u-preview__zoom'} style={state.position}>
                <img className={'u-preview__zoom-img'} src={state.img.src} alt={state.img.alt}/>
              </div>
            )
          }
        </div>
      )
    )

  }
}


export default portal(PreviewModal, document.body)
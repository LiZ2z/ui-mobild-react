import React from 'react';
import * as TYPES from './const'
import Icon from '../icon'

/**
 * @prop {any} title  头部标题, 不传 不渲染
 * @prop {any} content 内容
 * @prop {any} footer  底部按钮区, 默认为按钮, 传入会替换, 显示的传入footer={null} 隐藏底部
 * @prop {any} cancelContent  取消按钮里的内容
 * @prop {any} okContent  确认按钮里的内容
 * @props {boolean} needCloseBtn  是否需要右上角的关闭按钮
 * @prop {boolean} visible  控制显示隐藏
 * @prop {string} maskClass  蒙版
 * @prop {string} containerClass |className  容器
 * @prop {object} maskStyle
 * @prop {object} containerStyle
 *
 */

class Modal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isVisible: props.visible || props._isFunction,
    }

    this.onOk = this.onOk.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }
  onCancel(e) {
    if(!this.props.hasOwnProperty('visible')) {
      this.setState({ isVisible: false})
    }

    const fn = this.props.onCancel
    fn && fn(e)
  }
  onOk(e) {
    const props = this.props
    const fn = props.onOk
    fn && fn(e)

    if(!props._isFunction) return

    this.setState({ isVisible: false})

  }

  UNSAFE_componentWillReceiveProps(nextP) {
    if(nextP.visible !== this.props.visible) {
      this.setState({isVisible: nextP.visible})
    }
    if(nextP._toggle !== this.props._toggle && nextP._isFunction && !this.state.isVisible) {
      this.setState({isVisible: true})
    }
  }
  render() {
    const props = this.props
    const isVisible = this.state.isVisible
    const containerClass = 'u-modal-container'
      + (!props.title ? ' _no-title' : '')
      + (!props._isFunction ? ' _not-fn':'')
      + (' _'+props.type.toLowerCase())
      + (' '+(props.containerClass || props.className || ''))

    return (
      <div className={'u-modal-mask ' + (!isVisible ? '_hidden ' : '') + (props.maskClass||'')}
           style={props.maskStyle||null}
      >
        <div
          className={containerClass}
          style={props.containerStyle || null}
        >
          {/* 右上角关闭按钮*/}
          {props.needCloseBtn && <Icon className={'close u-modal-close-btn'} onClick={this.onCancel}/>}

          {/* title */}
          { props.title && <div className={'u-modal-header'}>{props.title}</div>}

          {/* content */}
          <div className={'u-modal-body'}>
            <div className={'u-modal-body-content'}>
              {props.children || props.content}
            </div>
          </div>

          {/* footer */}
          {
            props.footer || ( props.footer === null ? null : (
                <div className={'u-modal-footer border-top'}>
                  {/*alert模式下只需要 ok*/}
                  {
                    props.type !== TYPES.ALERT ? (
                      <div className={'u-modal-btn _cancel border-right'} onClick={this.onCancel}>
                        {props.cancelContent || '取消'}
                      </div>
                    ) : null
                  }
                  <div className={'u-modal-btn _ok'} onClick={this.onOk}>
                    {props.okContent || '确定'}
                  </div>
                </div>
              )
            )
          }
        </div>
      </div>
    )
  }
}

Modal.defaultProps = {
  type: ''
}


export default Modal
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Icon from '../icon'

/**
 *
 * @prop {any} title
 * @prop {any} content
 * @prop {any} footer
 * @prop {function} onClose
 * @prop {boolean} visible
 * @prop {boolean} disableMaskClick
 * @prop {string} className
 * @prop {string} maskClassName
 * @prop {boolean} removeCloseBtn
 *
 *
 * */
class PopupDialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: props.visible || false
    }

    this.closePopup = this.closePopup.bind(this)
    this.onConClick = this.onConClick.bind(this)
  }

  closePopup(type, e) {
    e.stopPropagation()
    const props = this.props
    // 如果不允许mask点击, 则 return
    if(type === 'mask' && props.disableMaskClick) return
    // 如果没有设置visible, 则默认关闭
    if(!props.hasOwnProperty('visible')) {
      this.setState({ visible: false})
      return
    }
    // 交由用户控制
    const fn = props.onClose
    fn && fn()
  }
  onConClick(e) {
    e.stopPropagation()
  }
  UNSAFE_componentWillReceiveProps(nextP) {
    if(nextP.visible !== this.state.visible) {
      this.setState({ visible: nextP.visible })
    }
  }
  render() {
    const state = this.state
    const props = this.props
    return state.visible && (
        <div className={'u-popup__mask ' + (props.removeMask?'_hidden ':'' ) +(props.maskClassName || '')}
           onClick={this.closePopup.bind(this, 'mask')}
      >
        <div className={'u-popup__container ' +(props.className || '')}
             onClick={this.onConClick}
        >
          {!props.removeCloseBtn && (
            <Icon className={'close u-popup__close-btn'} onClick={this.closePopup.bind(this, 'btn')}/>
          )}

          {
            props.title && <div className={'u-popup__title u-border-bottom'}>{props.title}</div>
          }
          <div className="u-popup__content">
            {props.children || props.content}
          </div>
          {
            props.footer && (
              <div className={'u-popup__footer'}>
                {props.footer}
                </div>
            )
          }
        </div>
      </div>
    )
  }
}

PopupDialog.defaultProps = {
  disableMaskClick: false,  // 禁止mask点击
  removeCloseBtn: false,    // 移除关闭按钮
  removeMask: false,        // 移除蒙版
  // title: null,
  // footer: null,
  // content: null,
  // visible: false,
}

PopupDialog.propTypes = {
  disableMaskClick: PropTypes.bool,
  removeCloseBtn: PropTypes.bool,
  removeMask: PropTypes.bool,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
}

export default PopupDialog
import React from 'react'
import './style.scss'
import Popup from '../index'

class Button extends React.PureComponent{
  render() {
    const {className, type, ...proxyProps} = this.props
    return <button type={'button'}
                   className={'u-btn-popup__btn u-border-top' + (type?(' _'+type):'') + (className?(' '+className):'')}
                   {...proxyProps}
    >
      {this.props.children}
      </button>
  }
}

class ButtonPopup extends React.PureComponent {

  render() {
    const {buttons, className,...proxyProps} = this.props
    return (
      <Popup
        className={'u-btn-popup__container ' + (className || '')}
        removeCloseBtn={true}
        {...proxyProps}
      >
        <div className={'u-btn-popup__content'}>
          {
            buttons.map((btn,i)=> (
              <Button key={i} type={'primary'} {...btn.props}>{btn.text}</Button>
            ))
          }
        </div>
        <div className={'u-btn-popup__footer'}>
          <Button onClick={this.props.onClose}>取消</Button>
        </div>
      </Popup>
    )
  }
}

ButtonPopup.defaultProps = {
  buttons: [],
  onClose: ()=>{},

}

export default ButtonPopup
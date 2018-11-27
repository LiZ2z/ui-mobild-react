import React, {Component} from 'react'
import './style.scss'
import Icon from '../../icon'
class Index extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: props.hasOwnProperty('value') ? props.value : props.defaultValue,
      isClearBtnShow: false
    }

    this.onChange = this.onChange.bind(this)
    this.blur = this.blur.bind(this)
    this.focus = this.focus.bind(this)
    this.clearInput = this.clearInput.bind(this)
  }
  onChange(e) {
    this.emit(e.target.value)
  }
  focus(e) {
	const value = e.target.value
	const {isClearBtnShow} = this.state;
    if(value && !isClearBtnShow) {
      this.setState({
        isClearBtnShow: true
      })
    }
	this.props.onFocus && this.props.onFocus()
}
blur(e) {
  const target = e.target;
  this.timeOut && clearTimeout(this.timeOut)
	this.timeOut = setTimeout(()=>{
    this.setState({
      isClearBtnShow: false
    })
    const value = target.value;
    this.props.onBlur && this.props.onBlur(value)
	},0)
	
  }
  clearInput() {
    if(!this.props.readOnly) {
      this.emit('');
      this.input.focus()
    }
  }
  emit(value) {
    
    value = value.replace(/(^\s+)|(\s+$)/g,"");
    if(this.props.types === 'number') {
      value =  value.replace(/[^\d.]/g,"").replace(/\.{15,}/g,".").replace(".","$#$").replace(/\./g,"").replace("$#$","."); 
      value= value.replace(/^(\-)*(\d+)\.(\d{0,15}).*$/,'$1$2.$3');//只能输入15个小数 
    }
    if(this.props.tofix == '2') {
      value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');//只能输入两个小数 
    }
    // if(this.hasValue) {
    //   newState.value = value
    // }
    this.setState({isClearBtnShow: !!value})
    const fn = this.props.onChange
    fn && fn(value)
  }
  UNSAFE_componentWillReceiveProps(nextP) {
    if(nextP.value !== this.props.value) {
      this.setState({value: nextP.value})
    }
  }
  componentWillUnmount() {
    this.timeOut && clearTimeout(this.timeOut)
  }
  render() {
    const state = this.state
    const {label,defaultValue, ...proxyProps} = this.props
    return (
      <label className={'needsclick u-input'+(this.props.className||'')}>
        <span className={'u-input__label'}>{label}</span>
        <input {...proxyProps}
            ref={el=>this.input=el}
            onChange={this.onChange}
            onBlur={this.blur}
            onFocus={this.focus}
            className={'u-input__exact'}
            value={state.value}
        />
        {state.isClearBtnShow && <Icon type={'icon_cuowu'} onClick={this.clearInput}/>}
      </label>
    )
  }
}
function getCursortPosition(ctrl) {
    var CaretPos = 0;   // IE Support
    if (document.selection) {
        ctrl.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart ('character', -ctrl.value.length);
        CaretPos = Sel.text.length;
    }
    // Firefox support
    else if (ctrl.selectionStart || ctrl.selectionStart == '0')
        CaretPos = ctrl.selectionStart;
    return (CaretPos);
}
export default Index

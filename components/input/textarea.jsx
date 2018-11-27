import React, {Component} from 'react'
import './style.scss'
import Autosize from 'autosize'
import Icon from '../../icon'
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value || props.defaultValue,
      isClearBtnShow: false
    }
    this.ele = React.createRef();
    this.flag = true;
    this.onChange = this.onChange.bind(this)
    this.clearInput = this.clearInput.bind(this)
    this.blur = this.blur.bind(this)
    this.focus = this.focus.bind(this)
    this.compositionstart = this.compositionstart.bind(this)
    this.compositionend = this.compositionend.bind(this)
    this.keyPress = this.keyPress;
  }
  componentDidMount() {
    this.textarea.addEventListener('compositionstart', this.compositionstart, false);
    this.textarea.addEventListener('compositionend', this.compositionend, false);
    window.addEventListener('keypress', this.keyPress, false)
    if(this.props.autosize) {
      Autosize(this.textarea)
    }
  }
  componentWillUnmount() {
    this.textarea && this.textarea.removeEventListener('compositionstart', this.compositionstart, false);
    this.textarea && this.textarea.removeEventListener('compositionend', this.compositionend, false);
    window.removeEventListener('keypress', this.keyPress, false)
    this.timeOut && clearTimeout(this.timeOut)
    Autosize.destroy(this.textarea)
  }
  keyPress(e) {
    this.keyCode = e.key.toLowerCase();
  }
  compositionstart() {
    this.flag = false
  }
  compositionend() {
    this.flag = true
  }
  onChange(e) {
      this.emit(e.target.value)
      Autosize.update(this.textarea)
  }
  blur(e) {
    this.timeOut && clearTimeout(this.timeOut)
    this.timeOut = setTimeout(()=>{
      this.setState({
        isClearBtnShow: false
      })
    },1)
    
    this.props.onBlur && this.props.onBlur(e.target.value)
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
  clearInput() {
    this.emit('');
    this.textarea.focus()
  }
  emit(value) {
    value = value.replace(/(^\s+)|(\s+$)/g,"");
    this.setState({isClearBtnShow: !!value});
    const fn = this.props.onChange
    // setTimeout(()=>{//中文输入拼音时不进行change
    //   if(this.flag) {
    //     fn && fn(value)
    //   } else if(this.keyCode === 'enter') {
    //     fn && fn(value)
    //   }
    // },0)
    fn && fn(value);
  }
  UNSAFE_componentWillReceiveProps(nextP) {
    if(nextP.value !== this.state.value) {
      this.setState({value: nextP.value})
    }
  }
  render() {
    const state = this.state
    const {label, ...proxyProps} = this.props
    return (
      <label className={'needsclick u-input '+(this.props.className||'')}>
        <span className={'u-input__label'}>{label}</span>
        <textarea rows="1" ref={el=>this.textarea=el} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck="false" {...proxyProps}
               onChange={this.onChange}
               className={'u-input__exact'}
               value={state.value}
               onBlur={this.blur}
               onFocus={this.focus}
        ></textarea>
        {state.isClearBtnShow && <Icon type={'icon_cuowu'} onClick={this.clearInput}/>}
      </label>
    )
  }
}

export default Index
import React, {Component} from 'react'
import './style.scss'
import PropTypes from 'prop-types'
import Context from './context'
import RadioIcon from './radio-icon'


class Radio extends Component {
  constructor(props) {
    super(props)
    this.init()
    this.toggleRadio = this.toggleRadio.bind(this)
  }

  init() {
    const props = this.props
    const pValue = props.value
    const bool = pValue && (typeof pValue === 'string' || typeof pValue === 'number')
    const id = props.id || (bool ? pValue : props.label)
    const value = props.value || id

    this.value = {
      id: id,
      label: props.label || null,
      value: value
    }

  }

  toggleRadio(e) {
    if (!e.target.checked) return
    const fn = this.props.onChange
    fn && fn(this.value)

  }

  shouldComponentUpdate(nP) {
    const id = this.value.id
    return (id === nP.checked) !== (id === this.props.checked)
  }

  render() {
    const props = this.props
    const checked = props.checked === this.value.id
    // 1. 要个label标签加 needsclick 类名， 不然如果用了fastclick 后，点击组件没有反应
    //
    // 要写成<label htmlFor='id'> 内容 </label> <input id='id'/>
    // 不能写成<label><input/>  内容  </label>
    // 否则点击label后会触发两次onClick事件，具体原因看
    // https://stackoverflow.com/questions/24501497/why-the-onclick-element-will-trigger-twice-for-label-element
    //
    // 上面的方法只能阻止 label标签的onClick不被触发两次
    // 对于更外层的onClick则不能，毕竟input的事件还是会冒泡上去
    // 解决方案就是 阻止input点击事件冒泡
    return (
      <label className={'needsclick radio ' + (checked ? 'is-checked ' : '') + (props.className || '')}>
        {props.children ||
        <span className='radio-label'>
          <RadioIcon/>
          {props.label}
          </span>
        }
        <input type='radio'
               className='radio__exact'
               onChange={this.toggleRadio}
               checked={checked}
               onClick={e => e.stopPropagation()}
        />
      </label>
    )
  }
}


Radio.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),  // label
  className: PropTypes.string //自定义类名
}

function extend(Comp) {
  return class RadioMiddlware extends React.Component {
    render() {
      return (
        <Context.Consumer>
          {obj => <Comp {...this.props} {...obj} />}
        </Context.Consumer>
      )
    }
  }
}

export default extend(Radio)

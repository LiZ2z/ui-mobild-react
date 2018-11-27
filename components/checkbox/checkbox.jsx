import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Context from './context'
import Icon from './icon'

/**
 * @prop {string} id
 * @prop {string} label
 * @prop {any} value
 * @prop {boolean} checked
 * @prop {boolean} defaultChecked
 *
 *
 */

class Checkbox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false
    }
    this.hasChecked = props.hasOwnProperty('checked')
    this.normalizeValue()
    this.resetState(props, true)
    this.toggleCheck = this.toggleCheck.bind(this)
  }

  normalizeValue() {
    const props = this.props
    const pValue = props.value
    const bool = pValue && (typeof pValue === 'string' || typeof pValue === 'number')
    const id = bool ? pValue : (props.id || props.label)
    const value = props.value || id
    this.value = {
      id: id,
      label: props.label || null,
      value: value
    }
  }

  resetState(props, isInit) {
    let checked = false
    // 如果是一组checkbox,
    if (props._isGroup) {
      checked = props._checked.indexOf(this.value.id) > -1
    }
    // 如果只使用单独一个 checkbox, 优先使用 props.checked
    // 如果没有 props.checked, 则在初始化化的时候使用 defaultChecked, 组件更新的时候使用自己的checked
    else {
      checked = (this.hasChecked ? props.checked : (isInit ? (props.defaultChecked || false) : this.state.checked))
    }

    isInit ? (this.state.checked = checked) : this.setState({checked: checked})

    checked && props._isGroup && props._onChange(true, this.value, false)
  }

  toggleCheck(e) {
    const checked = e.target.checked
    if (this.props._isGroup) {
      this.props._onChange(checked, this.value, true)
    } else {
      const fn = this.props.onChange
      fn && fn(checked, this.value)

      if (this.hasChecked) return
    }

    this.setState({
      checked: e.target.checked
    })
  }


  // props更新值, 默认值
  componentWillReceiveProps(nextP) {
    const cP = this.props
    if ((nextP._checked !== cP._checked) || (nextP.checked !== cP.checked)) {
      this.resetState(nextP)
    }
  }

  shouldComponentUpdate(nP, nS) {
    return nS.checked !== this.state.checked
  }

  render() {
    const {label, className, children} = this.props
    const {checked} = this.state
    return (
      <label className={'checkbox needsclick ' + (className || '') + (checked ? ' _checked' : '')}>
        {children ? children : (
          <React.Fragment>
            <Icon/>
            <span className='checkbox-label'>{label}</span>
          </React.Fragment>
        )}
        <input type='checkbox'
               className='checkbox__exact'
               onChange={this.toggleCheck}
               checked={checked}
               onClick={e => e.stopPropagation()}
        />
      </label>
    )
  }
}


/* Checkbox  props 类型检查 */
Checkbox.propTypes = {
  label: PropTypes.string,  // label
  checked: PropTypes.bool,  //初始默认选中
  className: PropTypes.string //自定义类名
}

function extend(Comp) {
  return class CheckboxContext extends React.Component {
    render() {
      return (
        <Context.Consumer>
          {obj => <Comp {...this.props} {...obj}/>}
        </Context.Consumer>
      )
    }
  }
}

export default extend(Checkbox)
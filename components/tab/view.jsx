import React, {Component} from 'react';
import './style.scss'
/**
 * @prop {array} panels
 * @prop {any} current 当前激活的panel
 * @prop {function} onChange
 * @prop {function} render
 * @prop {any} id 标志
 *
 * */
function isBase (v) {
  return typeof v === 'string' || typeof v === 'number'
}

class View extends Component {
  constructor(props) {
    super(props)
    this.hasCurrent = props.hasOwnProperty('current')
    this.state = {
      active: this.hasCurrent ? props.current : props.default,
      panels: this.normalize(props)
    }
  }
  normalize(props) {
    if(!props.panels) return []
    return props.panels.map(item=> {
      let isBaseType = isBase(item)
      const obj = Object.assign({}, isBaseType ? {content: item} : item)

      if(isBaseType || isBase(obj.content)) {
        isBaseType = true
        obj.content = String(obj.content)
      }

      if(!obj.hasOwnProperty('id')) {
        if(isBaseType) {
          obj.id = obj.content
        } else if(process.env.NODE_ENV === 'development') {
          throw ReferenceError('每个tab需要一个唯一id')
        }
      }
      return obj
    })
  }
  UNSAFE_componentWillReceiveProps(nextP){
    if(nextP.panels !== this.props.panels) {
      this.setState({panels: this.normalize(nextP)})
    }
    if(nextP.current !== this.props.current) {
      this.setState({ active: nextP.current })
    }
  }
  switchPanel(item, i) {
    const fn = this.props.onChange
    fn && fn(item.id, item, i)

    if(!this.hasCurrent) {
      this.setState({
        active: item.id
      })
    }
  }
  render() {
    const props = this.props
    const state = this.state
    return (
      <div className={'u-tab__container ' + (props.render ? '':'__default ') +(props.className || '')}>
        <div className={'u-tab__track'}>
          {
            state.panels.map((item, i) => (
              <div key={item.id}
                   className={(state.active === item.id ? 't-c-text _active t-c-bg__pseudo ':'') + "u-tab__panel"}
                   onClick={this.switchPanel.bind(this, item, i)}
              >
                {
                  props.render ? props.render(item.content) : item.content
                }
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}

export default View
import React from 'react';
import Context from './context'

/**
 * @prop {function} output
 * @prop {function} input
 * @prop {function} onChange
 * @prop {function} onSubmit
 * */

class Form extends React.Component {
  constructor(props) {
    super(props)
    this.getApi = this.getApi.bind(this)
    this.onFormItemChange = this.onFormItemChange.bind(this)

    this.formQuery = {}
    this.depMap = {}

    this.contextValue = {
      interfaces: this.getApi,  // 用于向父组件发送值
      onChange: this.onFormItemChange,
      //子表单组件获得焦点的时候, 按下 enter, 提交表单
      onSubmit: () => {
        this.props.onSubmit(this.formQuery)
      }
    }

  }

  /**
   * @function - 用于获取从label组件传过来的接口及参数，然后存储
   * @param {Object} param0
   */
  getApi({depQueue, subscribeDepChange}) {
    if (!depQueue) return
    const map = this.depMap
    depQueue.forEach(item => {
      !map[item] && (map[item] = [])
      map[item].push(subscribeDepChange)
    })
  }

  /**
   * @function - 当某个表单组件change时， 执行此函数
   */
  onFormItemChange(name, value, key) {
    // console.log(name, value)
    if (this.depMap[name]) {
      this.depMap[name].forEach(item => item(name, value))
    }

    /* --------------- */
    if (this.props.output) {
      key = key || name
      this.formQuery = this.props.output(value, key)
    } else {
      this.formQuery[name] = value
    }
    this.props.onChange(Object.assign({}, this.formQuery))
  }

  render() {

    return (
      <Context.Provider value={this.contextValue}>
        {this.props.children}
      </Context.Provider>
    )
  }
}


Form.config = {
  clickEnterToSubmit: true
}

Form.defaultProps = {
  onSubmit: () => {},
  onChange: () => {}
}

export default Form
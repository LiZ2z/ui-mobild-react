import React, {Component} from 'react'
import {Icon} from '@ui'
import Core from './search-core'


/**
 *
 * @props {string} modalClassname
 * @prop {string} className
 * @prop {any} children
 * @prop {string} placeholder
 * @prop {function} onSearchStart
 * @prop {function} onSearchCancel
 *
 * */
class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isActive: false,     // 搜索框激活状态
    }

    this.prepareToSearch = this.prepareToSearch.bind(this)
    this.onSearchCancel = this.onSearchCancel.bind(this)

  }
  prepareToSearch() {
    this.setState({
      isActive: true
    })
  }
  onSearchCancel() {
    this.setState({
      isActive: false
    })
  }

  render() {
    const state = this.state
    const {className, ...proxyProps} = this.props
    return (
      <div className={'u-search__container ' + (className || '')}>
        <div className={'u-search__input-wrap'}>
          <div className={'u-search__input'} onClick={this.prepareToSearch}></div>
          <span className={'u-search__placeholder'}>
              <Icon type={'icon_sousuo'}/>
              <span className={'_text'}>{proxyProps.placeholder}</span>
            </span>
        </div>
        {
          state.isActive && (
            <Core
              {...proxyProps}
              onCancel={this.onSearchCancel}
            />
          )
        }
      </div>
    )
  }
}


Search.defaultProps = {
  onSearchStart: () => {
  },
  onSearchCancel: () => {
  }
}

export default Search
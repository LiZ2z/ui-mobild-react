import React, {Component} from 'react'
import portal from '@ui/components/portal'
import {Icon} from '@ui'
import SearchResult from './search-result'
import config from './config'
import Loading from '../loading'

const DONE = 'D'
const SEARCHING = 'S'
const RESULT = 'R'
// const CANCEL = 'C'
const INIT = 'I'
const MOVING = 'M'

class SearchCore extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchStatus: DONE, // 搜索状态, 正在搜索 Searching ,  显示结果 result  完成 done
      inputStatus: INIT,     // 搜索框激活状态
      test: false,
      value: ''
    }
    this.reject = null
    this.input = {current: null}

    this.doSearch = debounce(props.onSearchStart, 800)
    this.onSearchChange = this.onSearchChange.bind(this)
    this.toggleActive = this.toggleActive.bind(this)
    this.cancelSearch = this.cancelSearch.bind(this)
    this.prepareToSearch = this.prepareToSearch.bind(this)
    this.clearInput = this.clearInput.bind(this)
  }
  componentDidMount(){
    this.input.current.focus()
    setTimeout(()=>{
      this.setState({
        inputStatus: MOVING
      })
      setTimeout(()=>{
        this.setState({
          inputStatus: DONE
        })
      }, 600)
    })

  }


  /**
   * @function - 切换搜索组件激活状态
   * 1. 输入框聚焦时激活
   * 2. 输入框内部没有值的情况下,失去焦点 或 点击取消按钮 时, 取消激活状态
   * */
  toggleActive() {
    if(!this.state.value) {
      this.cancelSearch()
    }
  }

  /**
   * @function - 取消搜索
   * */
  cancelSearch() {
    this.setState({
      searchStatus: DONE,
      value: '',
    })
    if (this.reject) {
      this.reject()
      this.reject = null
    }

    this.props.onSearchCancel()
    this.props.onCancel()
  }

  /**
   * @function - 清空输入框文本
   * */
  clearInput() {
    this.setState({value: ''})
    this.prepareToSearch('')
    this.input.current.focus()
  }

  /**
   * */
  onSearchChange(e) {
    const value = e.target.value
    if(value === this.value) return
    this.value = value
    const hasValue = !!value

    const newState = {
      searchStatus: hasValue ? SEARCHING : DONE,
      value: value
    }

    this.setState(newState)
    this.prepareToSearch(value)
  }

  prepareToSearch(value) {
    if (this.reject) this.reject()

    new Promise((resolve, reject) => {
      this.doSearch(value, resolve)
      this.reject = reject
    }).then(() => {
      this.setState({searchStatus: RESULT})
    })
      .catch(() => {
      })
  }
  render() {
    const state = this.state
    const props = this.props
    const pC = props.modalClassName
    const cC = config.modalClassName

    return (
      <div className={`u-search-mask${pC ? (' ' + pC) : ''}${cC ? (' ' + cC) : ''}`}
           style={props.modalStyle}
      >

        <div className={'u-search__container' + (state.inputStatus !== INIT ? ' _active' : '') }>
          <div className={'u-search__input-wrap'}>
            <input className={'u-search__input'}
                   onChange={this.onSearchChange}
                   placeholder={state.inputStatus === DONE ? props.placeholder : ''}
                   onBlur={this.toggleActive}
                   value={state.value}
                   ref={this.input}
            />
            {state.value && <Icon onClick={this.clearInput} className={'u-search__input-clear'} type="icon_quxiao"/>}
            <span className={'u-search__placeholder'}>
              <Icon type={'icon_sousuo'}/>
              {state.inputStatus !== DONE && <span className={'_text'}>{props.placeholder}</span>}
            </span>
          </div>

          <span className={'u-search__cancel-btn'} onClick={this.cancelSearch}>取消</span>
        </div>

        {
          state.searchStatus !== DONE && (
            <SearchResult render={
              state.searchStatus === RESULT
                ? (props.children ? props.children : <div className={'u-search__fetch-tip'}>没有结果</div>)
                : <div className={'u-search__fetch-tip'}>正在搜索<Loading className={'u-search-loading-icon'}/></div>
            }
            />
          )
        }
      </div>
    )
  }
}

function debounce(fn, time) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    if (!args[0]) return
    timer = setTimeout(() => {
      fn(...args)
    }, time)
  }
}


export default portal(SearchCore, document.body)
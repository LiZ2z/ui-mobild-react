import config from './config'
import {render, removeToast} from './render'
import './toast.scss'


const Toast = function (options) {
  render(normalize(options))
}

Toast.loading = {
  show: function (options) {
    options = Object.assign({}, normalize(options), {type: 'loading'})
    // loading状态, 不设置 duration 则默认一直显示
    options.duration = options.duration || 0

    render(options)
  },
  hide: removeToast
}

Toast.clear = removeToast


//格式验证, 标准化
function normalize(options){
  if(!options) return
  if(typeof options !== 'object') {
    options = {
      text: String(options)
    }
  }
  // loading状态只要不显示的设置 needMask 为 false,则 一定会显示mask
  if(options.needMask !== false) {
    options.needMask = true
  }
  return options
}


Toast.config = config

export default Toast
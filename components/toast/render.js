import {createElement, } from './dom';
import config from './config'

/**
 *@function - 渲染
 * */
let toastEl = null
let timer = null

function render(options) {

  if(timer || toastEl) {
    removeToast()
  }

  toastEl = realRender(options)

  if(options.duration === 0) return

  timer = setTimeout(function() {
    removeToast()
  }, options.duration || config.duration)
}

/**
 * @function 清除 toast
 *
 * */
function removeToast () {
  clearTimeout(timer)
  timer = null
  try {
    document.body.removeChild(toastEl)
  }catch(err) {
    // console.log(err)
  }
  toastEl = null
}



function realRender(options) {
  const isLoading = options.type === 'loading'
  const text =  options.text ? String(options.text) : ''
  const textEl = createElement('div',{ class: 'u-toast-text'}, text)
  let loadingEl = null

  if(isLoading) {
    loadingEl = createElement('div',{
      class: 'u-toast-loading',
      _html: config.loading
    })
  }

  const contentEl = createElement(
    'div',
    {
      class: 'u-toast-container ' + (options.position || config.position) + (isLoading ? ' _loading':'') + (isLoading && !text ? ' _no-text':''),
      style: options.style || config.style || ''
    },
    loadingEl,
    textEl
  )


  return document.body.appendChild(
    (typeof options.needMask !== 'undefined' ? options.needMask : config.needMask)
      ? createElement('div', {
        class: 'u-toast-mask',
        style: config.maskStyle
      }, contentEl)
      : contentEl
  )
}

export {
  removeToast,
  render
}
import React from 'react'
import Context from './context'

export const ADD = 'ADD'
export const UPDATE = 'UPDATE'
export const REMOVE = 'REMOVE'

const INIT = 'INIT'
const ADDED = 'ADDED'
const REMOVED = 'REMOVED'

let id = 0

class PreviewItem extends React.PureComponent {
  constructor(props) {
    super(props)

    this.img = {current: null}
    this.id = id++
    this.emitStatus = INIT
    this.preview = this.preview.bind(this)
  }
  componentDidMount() {
    this.emit(ADD)
  }
  UNSAFE_componentWillReceiveProps(nextP) {
    const nextC = nextP.children
    if(nextC !== this.props.children || nextP.src !== this.props.src) {
      this.emit(UPDATE, nextP)
    }
  }
  componentWillUnmount() {
    this.emit(REMOVE)
  }

  emit(type, props) {

    props = props || this.props
    const src = props.src || props.children.props.src

    if(type === ADD) {
      if(!src) return
      this.emitStatus = ADDED
    } else if(type === UPDATE) {
      if(!src) {
        type = REMOVE
        this.emitStatus = REMOVED
      } else {
        if(this.emitStatus !== ADDED){
          type = ADD
          this.emitStatus = ADDED
        }
      }
    }

    props.emit(type, {
      src: src,
      el: this.img.current,
      id: this.id
    } )
  }
  preview(e) {
    if(!this.props.src && !this.props.children) return

    this.props.preview(this.id, e)
  }

  render() {
    const children = this.props.children
    if(!children) return null
    return (
      <div className={'u-preview-item'} onClick={this.preview} ref={this.img}>
        {children}
      </div>
    )
  }
}

function PreviewContext(props) {
  return (
    <Context.Consumer>
      { obj => <PreviewItem {...props} {...obj} /> }
    </Context.Consumer>
  )
}

export default PreviewContext
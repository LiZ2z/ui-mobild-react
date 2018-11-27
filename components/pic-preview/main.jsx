import React from 'react'
import PreviewModal from './preview-modal'
import Context from './context'
import {
  ADD,
  REMOVE,
  UPDATE
} from './item'

/*
*
* @prop {number} duration 图片放大时过渡时长
*
* */
class ImgPreview extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      index: 0,
      position: null
    }

    this.imgs = []

    this.on = this.on.bind(this)
    this.preview = this.preview.bind(this)
    this.closePreview = this.closePreview.bind(this)

    this.contextObj = {
      emit: this.on,
      preview: this.preview
    }
  }

  preview(id) {

    let i = 0
    const imgs = this.imgs

    let len = imgs.length
    for (; i < len; i++) {
      if (id === imgs[i].id) break
    }
    if (i === len) return

    this.setState({
      visible: true,
      index: i,
    })
    this.props.onShow()
  }

  /**
   * @function - 接收从Preview.Item传过来的每个图片数据
   * */
  on(type, imgInfo) {
    let arr = this.imgs
    if (type === ADD) {
      arr = arr.concat(imgInfo)
    } else if (type === UPDATE) {
      arr = arr.map(item => (item.id !== imgInfo.id ? item : imgInfo))
    } else if (type === REMOVE) {
      arr = arr.filter(item => (item.id !== imgInfo.id))
    }
    this.imgs = arr
    const i = this.state.index
    if (arr.length <= i) {
      this.setState({
        index: arr.length - 1
      })
    } else {
      this.forceUpdate()
    }
  }

  closePreview() {

    this.setState({
      visible: false
    })
  }

  render() {
    return (
      <React.Fragment>
        <Context.Provider value={this.contextObj}>
          {this.props.children}
        </Context.Provider>
        <PreviewModal
          imgs={this.imgs}
          {...this.state}
          duration={this.props.duration}
          onClose={this.closePreview}
        />
      </React.Fragment>
    )
  }
}

ImgPreview.defaultProps = {
  duration: 300,
  onShow: () => {}
}

export default ImgPreview
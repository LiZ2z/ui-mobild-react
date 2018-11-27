import React from 'react';
// import portal from '@ui/components/portal'

class SearchResult extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isShadowShow: false
    }
    this.onScroll = this.onScroll.bind(this)
  }
  onScroll(e) {
    e.stopPropagation()
    const notTop = e.target.scrollTop !== 0
    const bool = this.state.isShadowShow
    if(bool !== notTop) {
      this.setState({
        isShadowShow: notTop
      })
    }
  }
  render() {
    const bool = this.state.isShadowShow
    return (
      <div className={'u-search-result ' + (bool ? '_shadow ':'')}
           onScroll={this.onScroll}
      >
        {this.props.render}
      </div>
    )
  }
}

export default SearchResult
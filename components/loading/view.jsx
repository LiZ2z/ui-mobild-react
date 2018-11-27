import React from 'react'

class Loading extends React.PureComponent {
  render() {
    return (
      <div className={"sk-folding-cube "+(this.props.className||'')}>
        <div className="sk-cube1 sk-cube"></div>
        <div className="sk-cube2 sk-cube"></div>
        <div className="sk-cube4 sk-cube"></div>
        <div className="sk-cube3 sk-cube"></div>
      </div>
    )
  }
}

export default Loading
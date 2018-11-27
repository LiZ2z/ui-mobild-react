import React from 'react'
class View extends React.PureComponent {
  render() {
    const {className, ...proxyProps} = this.props
    return (
      <div className={'u-icon u-icon__'+(className||'')} {...proxyProps}></div>
    )
  }
}

export default View
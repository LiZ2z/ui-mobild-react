import React from 'react';
import Base from './base'
import Icon from '../../icon/index'
import Cell from '../cell'

class IconCell extends React.PureComponent {
  render() {
    const {icon, title, ...proxyProps} = this.props
    return (
      <Cell 
        className='icon-cell'
        title={
          <React.Fragment>
            <Icon type={icon}/>
            {title}
          </React.Fragment>
        }
        {...proxyProps}/>
    );
  }
}

export default IconCell;
import React from 'react';
import ReactDOM from 'react-dom'

export default function (Comp, Container) {
  return function (props) {
    return ReactDOM.createPortal(<Comp {...props}/>, Container)
  }
}
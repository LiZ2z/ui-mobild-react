import './style.scss'
import View from './view'
import {alert, confirm} from './function'
import portal from '../portal'

const Modal = portal(View, document.body)


Modal.alert = alert
Modal.confirm = confirm

export default Modal
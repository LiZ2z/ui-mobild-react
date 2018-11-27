import './style.scss'
import View from './view'
import portal from '../portal'
import ButtonPopup from './button-popup'

const Popup = portal(View, document.body)
Popup.ButtonPopup = ButtonPopup
export default Popup
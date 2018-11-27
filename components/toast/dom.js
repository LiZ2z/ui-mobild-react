export function createElement(tagName, attributes, ...children) {
  const el = document.createElement(tagName)

  if (attributes) {
    for (let attr in attributes) {
      if(attr === '_html') {
        el.innerHTML = attributes[attr]
        continue
      }
      el.setAttribute(attr, attributes[attr])
    }
  }

  if(!children) return

  children.forEach(child => {
    if (!child) return
    if (typeof child === 'string') {
      el.innerText = child
    } else if (typeof el === 'object' && el.nodeType !== undefined) {
      el.appendChild(child)
    }
  })

  return el
}


export function addClass(el, className) {
  const oldClass = el.className
  if (oldClass.indexOf(className) > -1) return
  el.className = oldClass.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') + ' ' + className
}

export function removeClass(el, className) {
  if (!className) return
  // 空格判断不完整
  el.className = el.className.replace(new RegExp(`([\\s\\uFEFF\\xA0]?)${className}`, 'g'), '')
}
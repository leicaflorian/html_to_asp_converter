window.addEventListener('load', init)

let inputTextarea
let outputTextarea
let convertBtn

let dom

function init () {
  inputTextarea = document.querySelector('#inputTextarea')
  outputTextarea = document.querySelector('#outputTextarea')
  convertBtn = document.querySelector('#convertBtn')
  
  convertBtn.addEventListener('click', convert)
}

function convert () {
  dom = document.createElement('html')
  dom.innerHTML = inputTextarea.value
  
  // first most inner elements
  convertTexts()
  convertImages()
  
  convertLinks()
  convertPageLinks()
  
  outputTextarea.innerHTML = dom.innerHTML
}

function convertLinks () {
  dom.querySelectorAll('link, script').forEach((el) => {
    const key = el.src ? 'src' : (el.href ? 'href' : null)
    const value = el.getAttribute(key)
    
    if (value && !value.startsWith('http')) {
      el[key] = `<%= ResolveUrl("~/${value}") %>`
    }
  })
}

function convertImages () {
  const attrsMap = {
    'class': 'CssClass',
    'id': 'ID',
    'alt': 'AlternateText',
    'src': 'ImageUrl',
    'height': 'Height',
    'width': 'Width',
    'style': 'Style'
  }
  
  dom.querySelectorAll('img').forEach((el) => {
    const key = 'src'
    const value = el.getAttribute(key)
    
    if (value && !value.startsWith('http')) {
      if (!el.id) {
        el.id = createRandomId('img')
      }
      
      const attrs = createAttributes(el.attributes, attrsMap)
      
      el.after(`<asp:Image ${attrs.join(' ')} runat="server"/>`)
      el.remove()
    }
  })
}

function convertPageLinks () {
  const attrsMap = {
    'class': 'CssClass',
    'id': 'ID',
    'style': 'Style',
    'href': 'NavigateUrl'
  }
  
  dom.querySelectorAll('a').forEach((el) => {
    const key = 'href'
    const value = el.getAttribute(key)
    
    if (value && !value.startsWith('http')) {
      if (!el.id) {
        el.id = createRandomId('lnk')
      }
      
      const attrs = createAttributes(el.attributes, attrsMap)
      const htmlContent = el.innerHTML
      const text = el.innerText
      const innerHtml = htmlContent !== text ? (el.innerHTML.includes('&lt;') ? el.innerText : el.innerHTML) : ''
      
      if (!innerHtml) {
        attrs.push(`Text="${text}"`)
      }
      
      el.after(`<asp:HyperLink ${attrs.join(' ')} runat="server">${innerHtml}</asp:HyperLink>`)
      el.remove()
    }
    
    console.log(el)
  })
}

function convertTexts () {
  const attrsMap = {
    'class': 'CssClass',
    'id': 'ID',
    'style': 'Style',
    'text': 'Text'
  }
  
  dom.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,ol').forEach((el) => {
    const htmlContent = el.innerHTML
    const text = el.innerText
    
    if (!htmlContent) {
      return
    }
    
    if (!el.id) {
      el.id = createRandomId('lnk')
    }
    
    el.text = el.htmlContent
    
    const attrs = createAttributes(el.attributes, attrsMap)
    
    el.innerText = `<asp:Literal ${attrs.join(' ')} runat="server"></asp:Literal>`
    // el.remove()
    
    console.log(el)
  })
}

function createRandomId (prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 9)
}

function createAttributes (originalAttrs, attrsMap) {
  return Object.values(originalAttrs).map((attr) => {
    const key = attr.name
    const value = originalAttrs[key].value
    const attrKey = attrsMap[key] ?? key
    
    return `${attrKey}="${value}"`
  })
}

// Add plugin ID to <html>
const html = document.querySelector('html')
html.id = [
  ...html.id.split('\s'),
  'new-paint',
].filter(v => v).join(' ')

// Wrap posts' content in a <div> for styling purposes
document.querySelectorAll('.msgBody').forEach(el => {
  el.innerHTML = `<div class="msgContent">${el.innerHTML}</div>`
})

// Set up ZoomControls
class ZoomControls {
  constructor(containerEl) {
    const zoomWrapper = document.createElement('div')
    zoomWrapper.id = 'zoom-controls'

    const zoomOutBtn = document.createElement('button')
    zoomOutBtn.innerText = '-'
    zoomOutBtn.id = 'zoom-out'
    zoomWrapper.appendChild(zoomOutBtn)

    const zoomScaleTxt = document.createElement('span')
    zoomScaleTxt.innerText = 'x1'
    zoomScaleTxt.id = 'zoom-scale'
    zoomWrapper.appendChild(zoomScaleTxt)

    const zoomInBtn = document.createElement('button')
    zoomInBtn.innerText = '+'
    zoomInBtn.id = 'zoom-in'
    zoomWrapper.appendChild(zoomInBtn)

    containerEl.appendChild(zoomWrapper)

    this.containerEl = containerEl
    this.zoomScale = 1
    this.zoomWrapper = zoomWrapper
    this.zoomOutBtn = zoomOutBtn
    this.zoomScaleTxt = zoomScaleTxt
    this.zoomInBtn = zoomInBtn
    this.zoomElements = document.querySelectorAll('.zoom')
  }

  setup() {
    // Stop other click events (comming from forum's code)
    // on .zoom images from firing
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('zoom')) {
        e.stopPropagation()
        this.zoomElement(e.target, e)
      }
    }, true)

    // Add event listeners to - and + buttons
    this.zoomInBtn.addEventListener('click', () => this.zoomIn())
    this.zoomOutBtn.addEventListener('click', () => this.zoomOut())

    // Get stored zoomScale and update DOM
    chrome.storage.sync.get('zoomScale', data => {
      if (data.zoomScale)
        this.zoomScale = data.zoomScale
        this.update()
    })
  }

  zoomElement(el, e) {
    let scale = Math.round(el.height / el.naturalHeight)

    if (e.altKey && scale === 1) {
      scale = this.zoomScale
    } else if (e.altKey) {
      scale = 1
    } else if (e.shiftKey) {
      scale = scale - 1
    } else {
      scale = scale + 1
    }

    scale = Math.max(1, scale)

    el.width = el.naturalWidth * scale
    el.height = el.naturalHeight * scale
  }

  zoomIn() {
    this.zoomScale = this.zoomScale + 1

    this.update()
  }

  zoomOut() {
    this.zoomScale = Math.max(1, this.zoomScale - 1)

    this.update()
  }

  update() {
    chrome.storage.sync.set({
      zoomScale: this.zoomScale,
    })

    this.renderDOM()
  }

  renderDOM() {
    this.zoomScaleTxt.innerText = `x${this.zoomScale}`

    if (this.zoomScale > 1)
      this.zoomOutBtn.disabled = false
    else
      this.zoomOutBtn.disabled = true

    document.querySelectorAll('.zoom').forEach(el => {
      el.width = el.naturalWidth * this.zoomScale
      el.height = el.naturalHeight * this.zoomScale
    })
  }
}

const zoomControls = new ZoomControls(document.body)
zoomControls.setup()
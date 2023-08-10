export function stripNumber (num, precision = 12) {
  return +parseFloat(num.toPrecision(precision))
}

export function download (url, name) {
  if (typeof url === 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url)
  }
  let aLink = document.createElement('a')
  aLink.href = url
  aLink.download = name
  let event
  if (window.MouseEvent) {
    event = new MouseEvent('click')
  } else {
    event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  }
  aLink.dispatchEvent(event)
}
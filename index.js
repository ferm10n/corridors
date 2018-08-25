const homingSteps = 40
let originX = window.innerWidth / 2
let originY = window.innerHeight / 2
let originRotate = 0
let targetX = originX
let targetY = originY
const spawnFrameLimit = 6
let spawnFrameCount = 0

const two = new Two({
  type: Two.Types.canvas
})

// auto scaling
// function getLargestDimension () {
//   return Math.max(window.innerHeight, window.innerWidth)
// }
// let largestDimension = getLargestDimension()
two.on('resize', function () {
  let sh = $('body').height()
  $('canvas').height(sh)
  two.width = window.innerWidth

  two.height = window.innerHeight
  two.update()

  originX = two.width / 2
  originY = two.height / 2
  // largestDimension = getLargestD
})
window.addEventListener('resize', function () {
  two.trigger('resize')
})

let red = 255
let green = 255
let blue = 255

function makeRectangle () {
  const r = two.makeRectangle(originX, originY, 0, 0)
  r.stroke = `rgb(${red}, ${green}, ${blue})`
  r.linewidth = '3'
  r.fill = 'rgb(0,0,0)'
  r.rotation = originRotate

  function update () {
    const growthRate = 5
    r.width += growthRate
    r.height += growthRate
    r.stroke = `rgb(${red}, ${green}, ${blue})`

    const diag = Math.sqrt(r.width*r.width)/4
    const left = r.translation.x - diag
    const right = r.translation.x + diag
    const top = r.translation.y - diag
    const bottom = r.translation.y + diag

    if (left < 0 && top < 0 && right > two.width && bottom > two.height) {
      two.unbind('update', update)
      two.remove(r)
    }
  }
  two.bind('update', update)
}

// origin tracking
window.addEventListener('mousemove', function (e) {
  targetX = e.clientX
  targetY = e.clientY
})
two.bind('update', function updateOrigin () {
  originX = originX + (targetX - originX) / homingSteps
  originY = originY + (targetY - originY) / homingSteps

  const deltaX = Math.abs(originX - targetX)
  if (deltaX < 1) originX = targetX
  if (Math.abs(originY - targetY) < 1) originY = targetY


  if (originX < targetX) originRotate += .05 * (deltaX/two.width)
  if (originX > targetX) originRotate -= .05 * (deltaX/two.width)

  spawnFrameCount++
  if (spawnFrameCount > spawnFrameLimit) {
    makeRectangle()
    spawnFrameCount = 0
  }
})

function scaleRange (opts, val) {
  const targetRange = opts.maxTarget - opts.minTarget // 90
  const origRange = opts.maxOrig - opts.minOrig // 180
  return opts.minTarget + ((val - opts.minOrig) / origRange) * targetRange;
}

function clamp (magnitude, value) {
  if (value < -magnitude) return -magnitude
  if (value > magnitude) return magnitude
  return value
}

const xout = document.querySelector('#x');
const yout = document.querySelector('#y');
const zout = document.querySelector('#z');

// orientation tracking
const xMaxMag = 45
const yMaxMag = 45
window.addEventListener('deviceorientation', function (event) {
  let xRot = event.beta
  let yRot = event.gamma
  let zRot = event.alpha

  const _90to45 = {
    minOrig: -90,
    maxOrig: 90,
    minTarget: -45,
    maxTarget: 45
  }

  xRot = clamp(45, xRot)
  yRot = clamp(45, yRot)

  xout.innerHTML = xRot
  yout.innerHTML = yRot

  targetY = scaleRange({
    minOrig: -45,
    maxOrig: 45,
    minTarget: two.height,
    maxTarget: 0
  }, xRot)

  targetX = scaleRange({
    minOrig: -45,
    maxOrig: 45,
    minTarget: two.width,
    maxTarget: 0
  }, yRot)

  ///////

  zRot -= 180
  zRot = Math.abs(zRot)
  blue = green = scaleRange({
    minOrig: 0,
    maxOrig: 180,
    minTarget: 0,
    maxTarget: 255
  }, zRot)
  zout.innerHTML = zRot
  yout.innerHTML = blue
}, true)

// kickoff
two.renderer.domElement = document.querySelector('canvas')
two.renderer.ctx = two.renderer.domElement.getContext('2d')
two.trigger('resize')
two.play()

const homingSteps = 40
let originX = window.innerWidth / 2
let originY = window.innerHeight / 2
let originRotate = 0
let targetX = originX
let targetY = originY
const spawnFrameLimit = 12
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

function makeRectangle () {
  const r = two.makeRectangle(originX, originY, 0, 0)
  r.stroke = 'rgb(255,255,255)'
  r.linewidth = '2'
  r.fill = 'rgb(0,0,0)'
  r.rotation = originRotate

  function update () {
    const growthRate = 5
    r.width += growthRate
    r.height += growthRate

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

// kickoff
two.renderer.domElement = document.querySelector('canvas')
two.renderer.ctx = two.renderer.domElement.getContext('2d')
two.trigger('resize')
two.play()

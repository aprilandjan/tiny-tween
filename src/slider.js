/**
 * Created by Merlin on 16/8/13.
 */

class Slider {
  constructor () {
    this.init()
  }
  init () {
    this.direction = {
      BOTTOM_TO_TOP: 0,
      LEFT_TO_RIGHT: 1,
      TOP_TO_BOTTOM: 2,
      RIGHT_TO_LEFT: 3
    }

    window.addEventListener('touchstart', this.onStart.bind(this))
    // window.addEventListener('touchmove', this.onMove.bind(this))
    window.addEventListener('touchend', this.onEnd.bind(this))
    this.triggerDist = 50
    this.triggerInterval = 1000
  }
  onStart (e) {
    var touchObj = e.touches[0]
    var startX = parseInt(touchObj.clientX)
    var startY = parseInt(touchObj.clientY)
    this.startX = startX
    this.startY = startY
    this.startTime = Date.now()
    this.startAtTop = this.isElTop()
    this.startAtBottom = this.isElBot()
  }
  onMove (e) {
    // var touchObj = e.changedTouches[0]
    var body = document.body
    console.log(body.scrollTop, body.scrollHeight - window.innerHeight)
  }
  onEnd (e) {
    var interval = Date.now() - this.startTime
    if (interval > this.triggerInterval) {
      return
    }
    var touchObj = e.changedTouches[0]
    var endX = parseInt(touchObj.clientX)
    var endY = parseInt(touchObj.clientY)

    var hasEvent = false
    var dir = ''
    var d = Math.sqrt(Math.pow(endX - this.startX, 2) + Math.pow(endY - this.startY, 2))
    // console.log(d)
    if (d > this.triggerDist) {
      hasEvent = true
      var r = Math.atan2(endY - this.startY, endX - this.startX)
      r = 180 * r / Math.PI
      if (r <= -135 || r > 135) {
        // console.log('slide right to left!')
        dir = this.direction.RIGHT_TO_LEFT // 'rtl'
      } else if (r < -45) {
        // console.log('slide bottom to top!')
        dir = this.direction.BOTTOM_TO_TOP // 'btt'
      } else if (r < 45) {
        // console.log('slide left to right!')
        dir = this.direction.LEFT_TO_RIGHT // 'ltr'
      } else {
        // console.log('slide top to bottom!')
        dir = this.direction.TOP_TO_BOTTOM // 'ttb'
      }
    }
    if (hasEvent && this.callback) {
      this.callback.call(null, dir)
    }
  }
  onCancel (e) {
    // console.log(e)
  }
  isElTop () {
    return this.el.scrollTop === 0
  }
  isElBot () {
    return this.el.scrollTop >= this.el.scrollHeight - window.innerHeight
  }

  /**
   * 定义一个回调, 按照上右下左传递0,1,2,3
   * @param callback
   * @param el
     */
  on (callback, el) {
    // console.log('on')
    this.callback = callback
    this._el = el
  }
  off () {
    // console.log('off')
    this.callback = null
    this._el = null
    this.startAtTop = false
    this.startAtBottom = false
  }
  get el () {
    return this._el ? this._el : document.body
  }
  get atTop () {
    return this.isElTop() && this.startAtTop
  }
  get atBottom () {
    return this.isElBot() && this.startAtBottom
  }
}
var slider = new Slider()
export default slider

/**
 * Created by Merlin on 16/8/22.
 */

import Matrix2D from './Matrix2D'

var instanceMap = new Map()
var _transformKeys = ['x', 'y', 'scaleX', 'scaleY', 'skewX', 'skewY', 'rotation', 'regX', 'regY']
var _inlineKeys = ['opacity']   //  行内变换的style key
var _immediateKeys = ['scrollY']    //  立即变更的 key

class ElementWrapper {
    constructor(el) {
        if(typeof el == 'string') {
            this.el = document.querySelector(el);
        }
        else{
            this.el = el;
        }

        this.init()
    }

    init () {
        var styles = window.getComputedStyle(this.el);

        //===============
        //  transform
        //===============
        var transform = styles.transform
        var values
        if(!transform || transform == 'none'){
            values = [1, 0, 0, 1, 0, 0]
        }
        else{
            var matrix = transform.match(/\(([^)]+)\)/)[1]
            values = matrix.split(',')
        }

        //  ...values works like a charm
        this.matrix = new Matrix2D(...values)

        this.matrix.extract(this)
        // this.x
        // this.y
        // this.scaleX
        // this.scaleY
        // this.rotation
        this.regX = 0
        this.regY = 0

        //=================
        //  opacity
        //=================
        this.opacity = +styles.opacity || 1
    }

    get scrollY () {
        return this.el.scrollTop
    }

    set scrollY (val) {
        this.el.scrollTop = Math.round(val)
    }

    get maxScrollY () {
        return this.el.scrollHeight - this.el.offsetHeight
    }

    // Todo
    reset () {
        this.el.style.cssText = 'transform: none'
    }

    invalidate (key, value) {
        if (_transformKeys.indexOf(key) != -1) {
            this[key] = value

            // console.log(key, value)
            this._isTransformed = true
        }
        else if(_inlineKeys.indexOf(key) != -1) {
            this[key] = value
            this._isInlined = true
        }
    }

    validate () {
        var o = this

        var styles = []
        if(this._isTransformed) {
            styles.push('transform: '
                + this.matrix.applyWrapper(o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.skewX, o.skewY, o.regX, o.regY).toString())
        }

        if(this._isInlined) {
            styles.push('opacity: ' + this.opacity)
        }

        this.el.style.cssText = styles.join('; ')
    }

    /**
     * props: {
     *  x, y, scaleX, scaleY, skewX, skewY, regX, regY
     * }
     * @param props
     */
    validateNow (props) {
        if (props && typeof props === 'object') {
            for (var key in props) {
                if (props.hasOwnProperty(key)) {
                    this.invalidate(key, props[key])
                }
            }
        }

        this.validate()
    }

    static get (el) {
        if(typeof el === 'string') {
            el = document.querySelector(el)
        }

        if(!(el instanceof HTMLElement)) {
            throw new Error(`Can't find element by query syntax ${el}`);
        }

        var instance = instanceMap.get(el)
        if(!instance){
            instance = new ElementWrapper(el)
            instanceMap.set(el, instance)
        }

        return instance
    }
}

export default ElementWrapper;
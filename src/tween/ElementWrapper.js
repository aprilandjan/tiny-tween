/**
 * Created by Merlin on 16/8/22.
 */

import Matrix2D from './Matrix2D'

var instanceMap = new Map()

class ElementWrapper {
    constructor(el) {
        if(typeof el == 'string') {
            this.el = document.getElementById(el);
        }
        else{
            this.el = el;
        }

        this.init()
    }

    init () {
        var transform = window.getComputedStyle(this.el).transform
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
    }

    reset () {
        this.el.style.cssText = 'transform: none'
    }

    validate () {
        var o = this
        this.el.style.cssText = 'transform: '
            + this.matrix.applyWrapper(o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.skewX, o.skewY, o.regX, o.regY).toString()
    }

    static get (el) {
        if(typeof el === 'string') {
            el = document.getElementById(el)
        }

        if(!(el instanceof HTMLElement)) {
            throw new Error("Can't find element");
            return {}
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
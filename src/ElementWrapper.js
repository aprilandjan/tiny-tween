/**
 * Created by Merlin on 16/8/22.
 */


var instanceMap = new Map()

class ElementWrapper {
    constructor(el) {
        if(typeof el == 'string') {
            this.el = document.getElementById(el);
        }
        else{
            this.el = el;
        }

        //  any
        this._x = 0
        this._y = 0

        //  0~1
        this._scaleX = 1
        this._scaleY = 1

        //  any
        this._skewX = 0
        this._skewY = 0

        // ignore parse process
        // this.parseXY()
        // this.parseScale();
    }

    get scaleX () {
        return this._scaleX
    }

    get scaleY () {
        return this._scaleY
    }

    set scaleX (val) {
        this._scaleX = val;
    }

    set scaleY (val) {
        this._scaleY = val;
    }

    //  x 坐标
    get x () {
        return this._x
    }

    set x (val) {
        this._x = val
    }

    //  y 坐标
    get y () {
        return this._y
    }

    set y (val) {
        this._y = val
    }

    // 标记某属性失效
    invalidate (key, value) {
        if(!this._isInvalidate){
            this._invalidProps = {}
            this._isInvalidate = true
        }

        this._invalidProps[key] = value
    }

    validate () {
        if(this._isInvalidate) {
            this.el.style.cssText = 'transform: ' + this.getTransformMatrix(this._invalidProps)
        }
    }

    // matrix(a, b, c, d, e, f)
    //  a-c-dx
    //  b-d-dy
    //  0-0-1
    // a (m11) Horizontal scaling.
    // b (m12) Horizontal skewing.
    // c (m21) Vertical skewing.
    // d (m22) Vertical scaling.
    // e (dx) Horizontal moving.
    // f (dy) Vertical moving.
    getTransformMatrix (obj) {
        var a = obj.hasOwnProperty('scaleX') ? obj.scaleX : this._scaleX
        var b = obj.hasOwnProperty('skewX') ? obj.skewX : this._skewX
        var c = obj.hasOwnProperty('skewY') ? obj.skewY : this._skewY
        var d = obj.hasOwnProperty('scaleY') ? obj.scaleY : this._scaleY
        var e = obj.hasOwnProperty('x') ? obj.x : this._x
        var f = obj.hasOwnProperty('y') ? obj.y : this._y
        // console.log(a, b, c, d, e, f)
        return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
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
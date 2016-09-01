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

        //  any
        this._dx = +values[4]
        this._dy = +values[5]

        //  0~1
        this._a = +values[0]
        this._d = +values[3]

        //  any
        this._b = +values[1]
        this._c = +values[2]
    }

    // http://www.cs.mtu.edu/~shene/COURSES/cs3621/NOTES/geometry/geo-tran.html
    set rotation (deg) {

        deg -= this.rotation

        var rad = deg * Math.PI / 180
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);

        var a1 = this._a;
        var b1 = this._b;

        this._a = a1 * cos + this._c * sin;
        this._b = b1 * cos + this._d * sin;
        this._c = -a1 * sin + this._c * cos;
        this._d = -b1 * sin + this._d * cos;

        this.el.style.cssText = 'transform: ' + this.getTransformMatrix({})
    }

    //  -180 ~ 180
    get rotation () {
        return Math.round(Math.atan2(this._b, this._a) * (180 / Math.PI));
    }

    get scaleX () {
        return this._a
    }

    set scaleX (val) {
        this._a = val;
    }

    get scaleY () {
        return this._d
    }

    set scaleY (val) {
        this._d = val;
    }

    get skewX () {
        return this._b
    }

    set skewX (val) {
        this._b = val;
    }

    get skewY () {
        return this._c
    }

    set skewY (val) {
        this._c = val;
    }

    //  x 坐标
    get x () {
        return this._dx
    }

    set x (val) {
        this._dx = val
    }

    //  y 坐标
    get y () {
        return this._dy
    }

    set y (val) {
        this._dy = val
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
        this._a = obj.hasOwnProperty('scaleX') ? obj.scaleX : this.scaleX
        this._b = obj.hasOwnProperty('skewX') ? obj.skewX : this.skewX
        this._c = obj.hasOwnProperty('skewY') ? obj.skewY : this.skewY
        this._d = obj.hasOwnProperty('scaleY') ? obj.scaleY : this.scaleY
        this._dx = obj.hasOwnProperty('x') ? obj.x : this.x
        this._dy = obj.hasOwnProperty('y') ? obj.y : this.y

        //Todo: apply animation before it or after it?
        if(obj.hasOwnProperty('rotation')) {
            this.rotation = obj.rotation
        }

        return `matrix(${this._a}, ${this._b}, ${this._c}, ${this._d}, ${this._dx}, ${this._dy})`
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
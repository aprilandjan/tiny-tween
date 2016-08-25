/**
 * Created by Merlin on 16/8/22.
 */


var instanceMap = new Map()

class Element {
    constructor(el) {
        if(typeof el == 'string') {
            this.el = document.getElementById(el);
        }
        else{
            this.el = el;
        }

        this.parseXY()
        this.parseScale();
    }

    parseXY () {
        //  题目 transform
        var transform = this.el.style.transform
        if(transform){
            var pxs = transform.match(/\(([^)]+)\)/)[1]
            ps = pxs.split(',')
            this._x = parseFloat(ps[0]) || 0
            this._y = parseFloat(ps[1]) || 0
        }
        else{
            this._x = 0;
            this._y = 0;
        }
    }

    parseScale () {
        // Todo 提取 scale(50%, 50%)
        // var transform = this.el.style.transform
        // if(transform) {
        //
        // }
        // else {
        //     this._scaleX = 1;
        //     this._scaleY = 1;
        // }

        this._scaleX = this._scaleY = 1
    }

    get scaleX () {
        return this._scaleX
    }

    get scaleY () {
        return this._scaleY
    }

    set scaleX (val) {
        this._scaleX = val;
        var sx = val * 100 + '%'
        var sy = this.scaleY * 100 + '%'
        this.el.style.cssText = 'transform: scale(' + sx + ',' + sy + ')';
    }

    set scaleY (val) {
        this._scaleY = val;
        var sx = this.scaleX * 100 + '%'
        var sy = val * 100 + '%'
        this.el.style.cssText = 'transform: scale(' + sx + ',' + sy + ')';
    }

    //  x 坐标
    get x () {
        return this._x
    }

    set x (val) {
        this._x = val
        var x = val + 'px'
        var y = this.y + 'px'
        this.el.style.cssText = 'transform: translate(' + x + ',' + y + ')';
    }

    //  y 坐标
    get y () {
        return this._y
    }

    set y (val) {
        this._y = val
        var x = this.x + 'px'
        var y = val + 'px'
        this.el.style.cssText = 'transform: translate(' + x + ',' + y + ')';
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
            instance = new Element(el)
            instanceMap.set(el, instance)
        }

        return instance
    }
}

export default Element;
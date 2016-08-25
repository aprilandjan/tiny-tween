/**
 * Created by Merlin on 16/8/22.
 */

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
        var transform = this.el.style.transform
        if(transform) {
            
        }
        else {
            this._scaleX = 1;
            this._scaleY = 1;
        }
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
}

export default Element;
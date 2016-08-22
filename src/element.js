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
    }

    //  x 坐标
    get x () {
        return this.el.offsetLeft;
    }

    set x (val) {
        this.el.style.left = val + 'px';
    }

    //  y 坐标
    get y () {
        return this.el.offsetTop;
    }

    set y (val) {
        this.el.style.top = val + 'px';
    }
}

export default Element;
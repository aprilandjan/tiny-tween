'use strict';

/* eslint-disable */

/**
 * Created by Merlin on 16/9/2.
 */

class Matrix2D {

    /**
     *
     *  a-c-tx
     *  b-d-ty
     *  0-0-1
     *
     *  a (m11) Horizontal scaling.
     *  b (m12) Horizontal skewing.
     *  c (m21) Vertical skewing.
     *  d (m22) Vertical scaling.
     *  tx (tx) Horizontal moving.
     *  ty (ty) Vertical moving.
     */
    constructor (a, b, c, d, tx, ty) {
        this.a = +a
        this.b = +b
        this.c = +c
        this.d = +d
        this.tx = +tx
        this.ty = +ty
    }

    extract (wrapper) {
        if (wrapper == null) {
            wrapper = {};
        }

        wrapper.x = this.tx;
        wrapper.y = this.ty;
        wrapper.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
        wrapper.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);

        var skewX = Math.atan2(-this.c, this.d);
        var skewY = Math.atan2(this.b, this.a);

        var delta = Math.abs(1 - skewX / skewY);
        if (delta < 0.00001) { // effectively identical, can use rotation:
            wrapper.rotation = skewY / Matrix2D.DEG_TO_RAD;
            if (this.a < 0 && this.d >= 0) {
                wrapper.rotation += (wrapper.rotation <= 0) ? 180 : -180;
            }
            wrapper.skewX = wrapper.skewY = 0;
        } else {
            wrapper.skewX = skewX / Matrix2D.DEG_TO_RAD;
            wrapper.skewY = skewY / Matrix2D.DEG_TO_RAD;
            wrapper.rotation = 0
        }

        return wrapper;
    }

    append (a, b, c, d, tx, ty) {
        var a1 = this.a
        var b1 = this.b
        var c1 = this.c
        var d1 = this.d
        if (a != 1 || b != 0 || c != 0 || d != 1) {
            this.a = a1 * a + c1 * b
            this.b = b1 * a + d1 * b
            this.c = a1 * c + c1 * d
            this.d = b1 * c + d1 * d
        }
        this.tx = a1 * tx + c1 * ty + this.tx
        this.ty = b1 * tx + d1 * ty + this.ty
        return this;
    }

    applyWrapper (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        this.tx = this.ty = 0
        this.a = this.d = 1
        this.b = this.c = 0

        if (rotation % 360) {
            var r = rotation*Matrix2D.DEG_TO_RAD;
            var cos = Math.cos(r);
            var sin = Math.sin(r);
        } else {
            cos = 1;
            sin = 0;
        }

        if (skewX || skewY) {
            // TODO: can this be combined into a single append operation?
            skewX *= Matrix2D.DEG_TO_RAD;
            skewY *= Matrix2D.DEG_TO_RAD;
            this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
            this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
        } else {
            this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
        }

        if (regX || regY) {
            // append the registration offset:
            this.tx -= regX*this.a+regY*this.c;
            this.ty -= regX*this.b+regY*this.d;
        }
        return this;
    }

    reset () {

    }

    toString () {
        return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.tx}, ${this.ty})`
    }
}

Matrix2D.DEG_TO_RAD = Math.PI / 180

/* eslint-disable */

/**
 * Created by Merlin on 16/8/22.
 */

var instanceMap = new Map()
var _transformKeys = ['x', 'y', 'scaleX', 'scaleY', 'skewX', 'skewY', 'rotation', 'regX', 'regY']
var _inlineKeys = ['opacity']   //  行内变换的style key
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

/* eslint-disable */

//  source codes from createjs/tweenjs
//  https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js

var Ease = {};

/**
 * @method linear
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.linear = function(t) { return t; };

/**
 * Identical to linear.
 * @method none
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.none = Ease.linear;

/**
 * Mimics the simple -100 to 100 easing in Adobe Flash/Animate.
 * @method get
 * @param {Number} amount A value from -1 (ease in) to 1 (ease out) indicating the strength and direction of the ease.
 * @static
 * @return {Function}
 **/
Ease.get = function(amount) {
    if (amount < -1) { amount = -1; }
    if (amount > 1) { amount = 1; }
    return function(t) {
        if (amount==0) { return t; }
        if (amount<0) { return t*(t*-amount+1+amount); }
        return t*((2-t)*amount+(1-amount));
    };
};

/**
 * Configurable exponential ease.
 * @method getPowIn
 * @param {Number} pow The exponent to use (ex. 3 would return a cubic ease).
 * @static
 * @return {Function}
 **/
Ease.getPowIn = function(pow) {
    return function(t) {
        return Math.pow(t,pow);
    };
};

/**
 * Configurable exponential ease.
 * @method getPowOut
 * @param {Number} pow The exponent to use (ex. 3 would return a cubic ease).
 * @static
 * @return {Function}
 **/
Ease.getPowOut = function(pow) {
    return function(t) {
        return 1-Math.pow(1-t,pow);
    };
};

/**
 * Configurable exponential ease.
 * @method getPowInOut
 * @param {Number} pow The exponent to use (ex. 3 would return a cubic ease).
 * @static
 * @return {Function}
 **/
Ease.getPowInOut = function(pow) {
    return function(t) {
        if ((t*=2)<1) return 0.5*Math.pow(t,pow);
        return 1-0.5*Math.abs(Math.pow(2-t,pow));
    };
};

/**
 * @method quadIn
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.quadIn = Ease.getPowIn(2);
/**
 * @method quadOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.quadOut = Ease.getPowOut(2);
/**
 * @method quadInOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.quadInOut = Ease.getPowInOut(2);

/**
 * @method cubicIn
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.cubicIn = Ease.getPowIn(3);
/**
 * @method cubicOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.cubicOut = Ease.getPowOut(3);
/**
 * @method cubicInOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.cubicInOut = Ease.getPowInOut(3);

/**
 * @method quartIn
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.quartIn = Ease.getPowIn(4);
/**
 * @method quartOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.quartOut = Ease.getPowOut(4);
/**
 * @method quartInOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.quartInOut = Ease.getPowInOut(4);

/**
 * @method quintIn
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.quintIn = Ease.getPowIn(5);
/**
 * @method quintOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.quintOut = Ease.getPowOut(5);
/**
 * @method quintInOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.quintInOut = Ease.getPowInOut(5);

/**
 * @method sineIn
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.sineIn = function(t) {
    return 1-Math.cos(t*Math.PI/2);
};

/**
 * @method sineOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.sineOut = function(t) {
    return Math.sin(t*Math.PI/2);
};

/**
 * @method sineInOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.sineInOut = function(t) {
    return -0.5*(Math.cos(Math.PI*t) - 1);
};

/**
 * Configurable "back in" ease.
 * @method getBackIn
 * @param {Number} amount The strength of the ease.
 * @static
 * @return {Function}
 **/
Ease.getBackIn = function(amount) {
    return function(t) {
        return t*t*((amount+1)*t-amount);
    };
};
/**
 * @method backIn
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.backIn = Ease.getBackIn(1.7);

/**
 * Configurable "back out" ease.
 * @method getBackOut
 * @param {Number} amount The strength of the ease.
 * @static
 * @return {Function}
 **/
Ease.getBackOut = function(amount) {
    return function(t) {
        return (--t*t*((amount+1)*t + amount) + 1);
    };
};
/**
 * @method backOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.backOut = Ease.getBackOut(1.7);

/**
 * Configurable "back in out" ease.
 * @method getBackInOut
 * @param {Number} amount The strength of the ease.
 * @static
 * @return {Function}
 **/
Ease.getBackInOut = function(amount) {
    amount*=1.525;
    return function(t) {
        if ((t*=2)<1) return 0.5*(t*t*((amount+1)*t-amount));
        return 0.5*((t-=2)*t*((amount+1)*t+amount)+2);
    };
};
/**
 * @method backInOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.backInOut = Ease.getBackInOut(1.7);

/**
 * @method circIn
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.circIn = function(t) {
    return -(Math.sqrt(1-t*t)- 1);
};

/**
 * @method circOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.circOut = function(t) {
    return Math.sqrt(1-(--t)*t);
};

/**
 * @method circInOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.circInOut = function(t) {
    if ((t*=2) < 1) return -0.5*(Math.sqrt(1-t*t)-1);
    return 0.5*(Math.sqrt(1-(t-=2)*t)+1);
};

/**
 * @method bounceIn
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.bounceIn = function(t) {
    return 1-Ease.bounceOut(1-t);
};

/**
 * @method bounceOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.bounceOut = function(t) {
    if (t < 1/2.75) {
        return (7.5625*t*t);
    } else if (t < 2/2.75) {
        return (7.5625*(t-=1.5/2.75)*t+0.75);
    } else if (t < 2.5/2.75) {
        return (7.5625*(t-=2.25/2.75)*t+0.9375);
    } else {
        return (7.5625*(t-=2.625/2.75)*t +0.984375);
    }
};

/**
 * @method bounceInOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.bounceInOut = function(t) {
    if (t<0.5) return Ease.bounceIn (t*2) * .5;
    return Ease.bounceOut(t*2-1)*0.5+0.5;
};

/**
 * Configurable elastic ease.
 * @method getElasticIn
 * @param {Number} amplitude
 * @param {Number} period
 * @static
 * @return {Function}
 **/
Ease.getElasticIn = function(amplitude,period) {
    var pi2 = Math.PI*2;
    return function(t) {
        if (t==0 || t==1) return t;
        var s = period/pi2*Math.asin(1/amplitude);
        return -(amplitude*Math.pow(2,10*(t-=1))*Math.sin((t-s)*pi2/period));
    };
};
/**
 * @method elasticIn
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.elasticIn = Ease.getElasticIn(1,0.3);

/**
 * Configurable elastic ease.
 * @method getElasticOut
 * @param {Number} amplitude
 * @param {Number} period
 * @static
 * @return {Function}
 **/
Ease.getElasticOut = function(amplitude,period) {
    var pi2 = Math.PI*2;
    return function(t) {
        if (t==0 || t==1) return t;
        var s = period/pi2 * Math.asin(1/amplitude);
        return (amplitude*Math.pow(2,-10*t)*Math.sin((t-s)*pi2/period )+1);
    };
};
/**
 * @method elasticOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.elasticOut = Ease.getElasticOut(1,0.3);

/**
 * Configurable elastic ease.
 * @method getElasticInOut
 * @param {Number} amplitude
 * @param {Number} period
 * @static
 * @return {Function}
 **/
Ease.getElasticInOut = function(amplitude,period) {
    var pi2 = Math.PI*2;
    return function(t) {
        var s = period/pi2 * Math.asin(1/amplitude);
        if ((t*=2)<1) return -0.5*(amplitude*Math.pow(2,10*(t-=1))*Math.sin( (t-s)*pi2/period ));
        return amplitude*Math.pow(2,-10*(t-=1))*Math.sin((t-s)*pi2/period)*0.5+1;
    };
};
/**
 * @method elasticInOut
 * @param {Number} t
 * @static
 * @return {Number}
 **/
Ease.elasticInOut = Ease.getElasticInOut(1,0.3*1.5);

/* eslint-disable */

/**
 * Created by Merlin on 16/8/19.
 */

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelAnimationFrame = (function(id) {
    return window.cancelAnimationFrame
        || window.webkitCancelAnimationFrame
        || window.mozCancelAnimationFrame
        || window.oCancelAnimationFrame
        || window.msCancelAnimationFrame
        || function(id) {
            window.clearTimeout(id)
        }
})();

//  总的每帧事件
var _raf = null;
var _tList = [];
var _lastTickTime;
var _isPaused = false

//  投影值
var mapping = function (val, inputMin, inputMax, outputMin, outputMax) {
    return ((outputMax - outputMin) * ((val - inputMin) / (inputMax - inputMin))) + outputMin
};

var _register = function (tween) {
    if(_tList.indexOf(tween) != -1){
        return
    }

    _tList.push(tween);

    //  如果没有开启, 那么开启
    if(!_raf){
        _lastTickTime = Date.now();
        _raf = window.requestAnimationFrame(_tick);
    }
};

var _unregister = function (tween) {
    var list = _tList;
    list.splice(list.indexOf(tween), 1);

    if(!list.length) {
        window.cancelAnimationFrame(_raf);
        _raf = null;
    }
};

//  总的帧事件
var _tick = function () {
    var now = Date.now();
    var delta = now - _lastTickTime
    _lastTickTime = now

    if(!_isPaused){   //delta > 1000 / fps
        _tList.forEach((tween) => {
            _tweenTick(tween, delta)
        });
    }

    _raf = window.requestAnimationFrame(_tick);
};

var _readState = function (t) {
    if(t.currentState || !t.states.length) {
        return;
    }

    //  暂存当前状态, 作为这个state的启动状态
    var state = t.states[0]
    t.currentState = state
    var obj = t.obj
    switch(state.type) {
        case stateType.TO:
        case stateType.APPEND:
            let from = {};
            for(let key in state.to){
                if(state.to.hasOwnProperty(key)  && (obj.hasOwnProperty(key) || obj.__lookupGetter__(key))) {
                    from[key] = obj[key];  //  start state
                    if(state.type == stateType.APPEND) {
                        state.to[key] += from[key]
                    }
                }
            }

            if(state.type == stateType.APPEND) {
                state.type = stateType.TO
            }

            state.from = from;
            state.elapsedTime = 0;
            break;
        case stateType.WAIT:
            state.elapsedTime = 0;
            break;
        case stateType.CALL:
            state.duration = 0;
            state.elapsedTime = 0;
            break;
        case stateType.SET:
            state.duration = 0;     //  will not wait util next tick
            state.elapsedTime = 0
            _assignProps(t, state, 1)
            break;
    }
}

//  assign
var _assignProps = function (t, state, p) {
    var obj = t.obj
    var to = state.to;
    for(var key in to){
        if(to.hasOwnProperty(key)){
            if(t.isElement) {
                obj.invalidate(key, to[key])
            }
            else{
                obj[key] = to[key]
            }
        }
    }

    if(t.isElement){
        obj.validate()
    }
}

var _tweenTick = function (t, delta) {
    //  当前所处的状态
    var state = t.currentState;
    if(!t.currentState) {
        return
    }

    state.elapsedTime += delta

    //  找到这个状态的百分比
    var p = state.duration == 0 ? 1 : (state.elapsedTime / state.duration);
    if (p > 1) {
        p = 1
    } else if (p < 0) {
        p = 0
    }

    //  判断状态类型
    switch(state.type){
        case stateType.TO:
        case stateType.APPEND:
            let from = state.from;
            let to = state.to;
            let ease = state.ease;

            let ep = p;
            if(p != 1 && ease && typeof ease == 'function'){
                ep = ease(p);
            }

            let obj = t.obj;
            for(let key in to){
                if(to.hasOwnProperty(key)){
                    let v = mapping(ep, 0, 1, from[key], to[key])
                    if(t.isElement) {
                        obj.invalidate(key, v)
                    }
                    else{
                        obj[key] = v
                    }
                }
            }

            //
            if(t.isElement){
                obj.validate()
            }

            if(t.config && t.config.onChange){
                t.config.onChange.call(t.config.onChangeObj);
            }
            break;
        case stateType.WAIT:
            //  do nothing
            break;
        case stateType.CALL:
            let callback = state.callback;
            let scope = state.scope;
            let args = state.args;
            callback.apply(scope, args);
            break;
        case stateType.SET:
            //  do nothing, just wait for one tick
            break;
    }

    //  此状态结束了
    if(p >= 1){
        t.passedStates.push(t.states.shift())
        t.currentState = null;
        if(t.states.length) {
            _readState(t);
        }
        else {
            //  loop, swap states
            //  如果是set调用的,会导致循环
            if(t.config && t.config.loop) {
                t.states = t.passedStates;
                t.passedStates.slice(0);
                _readState(t);
            }
            else {
                if(t.config && t.config.onComplete){
                    t.config.onComplete.call(t.config.onCompleteObj)
                }
                _unregister(t);
            }
        }
    }
}

//  定义不同的状态类型
var stateType = {
    TO: 0,
    WAIT: 1,
    CALL: 2,
    APPEND: 3,
    SET: 4
}

class Tween {

    /**
     * 可以配置:
     *
     *  onChange,
     *  onChangeObj,
     *
     *  onComplete,
     *  onCompleteObj,
     *
     *  override,
     *
     *  loop
     *
     * @param obj
     * @param config
     */
    constructor (obj, config) {

        if(typeof obj === 'string' || obj instanceof HTMLElement) {
            obj = ElementWrapper.get(obj)
            this.isElement = true
        }
        else if(obj instanceof ElementWrapper) {
            this.isElement = true
        }

        this.obj = obj;
        this.config = config;
        this.states = [];   //  状态列表
        this.passedStates = []; //  过去了的状态
    }

    static get(obj, config) {

        if(config && config.override){
            Tween.kill(obj)
        }

        //  如果动画没开始, 开启动画
        return new Tween(obj, config);
    }

    /**
     *
     * 移除某对象的全部缓动
     *
     * @param obj, DOM Element, Element ID, ElementWrapper instance
     *
     */
    static kill(obj) {
        _tList = _tList.filter((tween, index) => {
            //  如果是字符串, 认为是id, 查找wrapper
            if(typeof obj === 'string' || obj instanceof HTMLElement){
                obj = ElementWrapper.get(obj)
            }

            return tween.obj != obj
        })
    }

    static killAll () {
        _tList.length = 0
    }

    static pauseAll () {
        _isPaused = true
    }

    static resumeAll () {
        _isPaused = false
    }

    static get isPaused () {
        return _isPaused
    }

    /**
     *
     * 缓动到某种状态。当进入到当前状态的时候, 取这个状态的初始值
     * @param target
     * @param duration
     * @param ease, function from Ease.js
     *
     */
    to (target, duration, ease){
        //  定义一个状态
        var state = {
            type: stateType.TO,
            ease: ease,
            duration: duration || 0,
            to: target
        };

        if(this.isElement && target.hasOwnProperty('scale')) {
            target.scaleY = target.scaleX = target.scale
            delete target['scale']
        }

        this.states.push(state);
        _readState(this);

        _register(this);
        return this;
    }

    append (target, duration, ease) {
        var state = {
            type: stateType.APPEND,
            ease: ease,
            duration: duration || 0,
            to: target
        }

        if(this.isElement && target.hasOwnProperty('scale')) {
            target.scaleY = target.scaleX = target.scale
            delete target['scale']
        }

        this.states.push(state)
        _readState(this);

        _register(this)
        return this
    }

    /**
     * 设置此 tween obj 的属性
     *
     * set 是立即的过程, 不会等到下一帧
     *
     * @param target
     */
    set (target) {
        var state = {
            type: stateType.SET,
            to: target
        }

        if(this.isElement && target.hasOwnProperty('scale')) {
            target.scaleX = target.scaleY = target.scale
            delete target['scale']
        }

        this.states.push(state)
        _readState(this);

        _register(this)
        return this
    }

    /**
     *
     * 在当前状态等待多久
     *
     * @param duration
     */
    wait (duration) {
        var state = {
            type: stateType.WAIT,
            duration: duration
        }

        this.states.push(state);
        _readState(this);

        _register(this);
        return this;
    }

    /**
     *
     * 回调
     *
     * @param callback
     * @param scope
     * @param args 参数数组
     */
    call (callback, scope, args) {
        var state = {
            type: stateType.CALL,
            callback: callback,
            scope: scope,
            args: args
        }

        this.states.push(state);
        _readState(this);
        _register(this);
        return this;
    }
}

Tween.Ease = Ease
Tween.Wrapper = ElementWrapper

module.exports = Tween;
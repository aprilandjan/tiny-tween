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


//  总的每帧事件
var _raf = null;
var _animList = [];
var _currentTime = 0;
var _stopTime = 0;

//  投影值
var mapping = function (val, inputMin, inputMax, outputMin, outputMax) {
    return ((outputMax - outputMin) * ((val - inputMin) / (inputMax - inputMin))) + outputMin
};

var _register = function (anim) {
    if(_animList.indexOf(anim) != -1){
        return
    }

    _animList.push(anim);

    //  如果没有开启, 那么开启
    if(!_raf){
        _currentTime = Date.now();
        _raf = window.requestAnimationFrame(_tick);
    }
};

var _unregister = function (anim) {
    var list = _animList;
    list.splice(list.indexOf(anim), 1);

    if(!list.length) {
        window.cancelAnimationFrame(_raf);
        _raf = null;
    }
};

//  总的帧事件
var _tick = function () {
    var now = Date.now();
    //  tick duration
    var delta = now - _currentTime;
    //  current time edge
    _currentTime = now;

    if(true){   //delta > 1000 / Animator.fps
        _animList.forEach((anim, index) => {
            anim.tick(now);
        });

        if(_currentTime > _stopTime){
            window.cancelAnimationFrame(_tick);
            _raf = null;
        }
        else{   //  继续动画
            _raf = window.requestAnimationFrame(_tick);
        }
    }
    else{   //  没到时间间隔, 继续动画
        _raf = window.requestAnimationFrame(_tick);
    }
};

class Animator {

    /**
     * 可以配置:
     *
     *  onChange,
     *  onChangeObj,
     *
     *  onComplete,
     *  onCompleteObj
     *
     * @param obj
     * @param config
     */
    constructor (obj, config) {
        this.obj = obj;
        this.config = config;
        this.states = [];   //  状态列表
    }

    static get(obj, config) {
        //  如果动画没开始, 开启动画
        return new Animator(obj, config);
    }

    /**
     *
     * 缓动到某种状态。当进入到当前状态的时候, 取这个状态的初始值
     * @param target
     * @param duration
     * @param ease, function from Ease.js
     */
    to (target, duration, ease){

        //  定义一个状态
        var state = {
            ease: ease,
            duration: duration,
            to: target
        };

        //  把状态推入数组
        this.states.push(state);
        this.initState();

        _register(this);
        return this;
    }

    initState () {
        if(this.currentState || !this.states.length) {
            return;
        }

        //  暂存当前状态, 作为这个state的启动状态
        var nextState = this.states[0];
        var from = {};
        for(var key in nextState.to){
            if(nextState.to.hasOwnProperty(key)  && (this.obj.hasOwnProperty(key) || this.obj.__lookupGetter__(key))) {
                from[key] = this.obj[key];
            }
        }
        this.currentState = nextState;
        nextState.from = from;
        nextState.startTime = Date.now();

        if(_stopTime < nextState.startTime + nextState.duration){
            _stopTime = nextState.startTime + nextState.duration;
        }
    }

    tick (now){
        //  先找到当前所处的状态
        var state = this.currentState;
        var startTime = state.startTime;
        var duration = state.duration;
        var from = state.from;
        var to = state.to;
        var ease = state.ease;

        //  找到这个状态的百分比
        var p = (now - startTime) / duration;
        if(p > 1) {
            p = 1
        }
        else if(p < 0) {
            p = 0
        }
        var ep = p;
        if(ease && typeof ease == 'function'){
            ep = ease(p);
        }

        var obj = this.obj;
        for(var key in to){
            //  如果两方面都有这个属性, 那么计算投影值
            if(to.hasOwnProperty(key)){
                obj[key] = mapping(ep, 0, 1, from[key], to[key]);
            }
        }

        //
        if(this.config.onChange){
            this.config.onChange.call(this.config.onChangeObj);
        }

        //  此状态结束了
        if(p >= 1){
            this.states.shift();
            this.currentState = null;

            if(this.states.length) {
                this.initState();
            }
            else {
                _unregister(this);
            }
        }
    }
}

Animator.fps = 60;

export default Animator;

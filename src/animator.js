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

//  定义不同的状态类型
var stateType = {
    TO: 0,
    WAIT: 1,
    CALL: 2
}

class Animator {

    /**
     * 可以配置:
     *
     *  onChange,
     *  onChangeObj,
     *
     *  onComplete,
     *  onCompleteObj,
     *
     *  override
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

        if(config && config.override){
            Animator.kill(obj)
        }

        //  如果动画没开始, 开启动画
        return new Animator(obj, config);
    }

    /**
     *
     * 移除某对象的全部缓动
     *
     * @param obj
     */
    static kill(obj) {
        _animList = _animList.filter((anim, index) => {
            return anim.obj != obj
        })
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
            type: stateType.TO,
            ease: ease,
            duration: duration,
            to: target
        };

        this.states.push(state);
        this.initState();

        _register(this);
        return this;
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
        this.initState();

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
        this.initState();

        _register(this);
        return this;
    }

    initState () {
        if(this.currentState || !this.states.length) {
            return;
        }

        //  暂存当前状态, 作为这个state的启动状态
        var state = this.states[0];
        this.currentState = state;
        switch(state.type) {
            case stateType.TO:
                var from = {};
                for(var key in state.to){
                    if(state.to.hasOwnProperty(key)  && (this.obj.hasOwnProperty(key) || this.obj.__lookupGetter__(key))) {
                        from[key] = this.obj[key];
                    }
                }
                state.from = from;
                state.startTime = Date.now();
                state.stopTime = state.startTime + state.duration

                if(_stopTime < state.stopTime){
                    _stopTime = state.stopTime;
                }
                break;
            case stateType.WAIT:
                state.startTime = Date.now();
                state.stopTime = state.startTime + state.duration

                if(_stopTime < state.stopTime){
                    _stopTime = state.stopTime;
                }
                break;
            case stateType.CALL:

                break;
        }
    }

    tick (now){
        //  当前所处的状态
        var state = this.currentState;

        //  找到这个状态的百分比
        var p = (now - state.startTime) / state.duration;
        if(p > 1) {
            p = 1
        }
        else if(p < 0) {
            p = 0
        }

        //  判断状态类型
        switch(state.type){
            case stateType.TO:
                let from = state.from;
                let to = state.to;
                let ease = state.ease;

                let ep = p;
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

                if(this.config && this.config.onChange){
                    this.config.onChange.call(this.config.onChangeObj);
                }
                break;
            case stateType.WAIT:
                //  do nothing
                break;
            case stateType.CALL:
                let callback = state.callback;
                let scope = state.scope;
                let args = state.args;
                callback.call(scope, args);
                break;
        }

        //  此状态结束了
        if(p >= 1){
            this.states.shift();
            this.currentState = null;

            if(this.states.length) {
                this.initState();
            }
            else {
                //  no more further states, call onComplete
                if(this.config && this.config.onComplete){
                    this.config.onComplete.call(this.config.onCompleteObj)
                }
                _unregister(this);
            }
        }
    }
}

// Animator.fps = 60;

export default Animator;

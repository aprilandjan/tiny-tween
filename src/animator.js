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
    }

    static get(obj, config) {
        //  如果动画没开始, 开启动画
        return new Animator(obj, config);
    }

    static _register (anim) {
        Animator._animList.push(anim);
        if(Animator._stopTime < anim.stopTime){
            Animator._stopTime = anim.stopTime;

            //  如果没有开启, 那么开启
            if(!Animator._raf){
                Animator._currentTime = Date.now();
                Animator._raf = window.requestAnimationFrame(Animator._tick);
            }
        }
    }

    static _unregister (anim) {
        var list = Animator._animList;
        list.splice(list.indexOf(anim), 1);

        if(!list.length) {
            window.cancelAnimationFrame(Animator._raf);
            Animator._raf = null;
        }
    }

    //  总的帧事件
    static _tick () {
        var now = Date.now();
        //  tick duration
        var delta = now - Animator._currentTime;
        //  current time edge
        Animator._currentTime = now;

        if(true){   //delta > 1000 / Animator.fps

            //  对每个动画对象, 应用当前时间
            Animator._animList.forEach((anim, index) => {
                anim.tick(now);
            });

            //  停掉动画
            if(Animator._currentTime > Animator._stopTime){
                window.cancelAnimationFrame(Animator._tick);
                Animator._raf = null;
            }
            else{   //  继续动画
                Animator._raf = window.requestAnimationFrame(Animator._tick);
            }
        }
        else{   //  没到时间间隔, 继续动画
            Animator._raf = window.requestAnimationFrame(Animator._tick);
        }
    }

    /**
     *
     * 缓动到某种状态。当进入到当前状态的时候, 取这个状态的初始值
     * @param target
     * @param duration
     * @param ease, function from Ease.js
     */
    to (target, duration, ease){

        // var status = {
        //
        // };

        //  目标状态
        this.target = target;
        //  暂存当前状态
        var temp = {};
        for(var key in target){
            if(target.hasOwnProperty(key)  && (this.obj.hasOwnProperty(key) || this.obj.__lookupGetter__(key))) {
                temp[key] = this.obj[key];
            }
        }
        this.tempTarget = temp;

        this.ease = ease;
        this.duration = duration;

        //  应该开始结束的事件
        this.startTime = Date.now();
        this.stopTime = this.startTime + this.duration;

        //  动画时长为0, 立即达到
        if(duration == 0){
            this.tick(1);
        }
        else{   //  时长非0, 注册该缓动
            Animator._register(this);
        }

        return this;
    }

    tick (now){
        //  运行百分比
        var p = (now - this.startTime) / this.duration;
        if(this.ease && typeof this.ease == 'function'){
            p = this.ease(p);
        }

        var temp = this.tempTarget;
        var target = this.target;
        var obj = this.obj;
        for(var key in temp){
            //  如果两方面都有这个属性, 那么计算投影值
            if(temp.hasOwnProperty(key)){
                obj[key] = Animator.mapping(p, 0, 1, temp[key], target[key]);
            }
        }

        //
        if(this.config.onChange){
            this.config.onChange.call(this.config.onChangeObj);
        }

        if(now > this.stopTime){
            Animator._unregister(this);
        }
    }

    //  投影值
    static mapping (val, inputMin, inputMax, outputMin, outputMax) {
        return ((outputMax - outputMin) * ((val - inputMin) / (inputMax - inputMin))) + outputMin
    }
}

Animator.fps = 60;
//  总的每帧事件
Animator._raf = null;
Animator._animList = [];
Animator._stopTime = 0;

export default Animator;

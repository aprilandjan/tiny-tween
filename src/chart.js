/**
 * Created by Merlin on 16/8/17.
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

var DrawBlocks = function(elID, config){
    var canvas = document.getElementById(elID);

    this.config = config;
    var w = config.w || canvas.offsetWidth;
    var h = config.h || canvas.offsetHeight;

    this.dpr = window.devicePixelRatio || 1;

    this.paddingTop = config.paddingTop;
    this.fontSize = config.fontSize || 10;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width = w * this.dpr;
    this.h = this.canvas.height = h * this.dpr;
    this.barWidth = this.w * (424 / 750);
    this.barHeight = 8;
    this.p = 1;

    this.pts = this.config.pts || [];
    this.num = this.pts.length;
    this.divY = this.h / this.num;

    this.values = [];
    for(var i = 0; i < this.num; i++){
        this.values.push({
            value1: this.pts[i].value
        });
    }

    this.ctx.save();

    //  离屏
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = this.w;
    this.offscreen.height = this.h;

    this.redraw(this.pts);
};

DrawBlocks.prototype.redraw = function(pts, duration, ease) {

    if(!pts.length){
        return;
    }

    duration = duration || 2000;
    ease = ease || 1;

    this.pts = pts;
    this.num = pts.length;
    this.divY = this.h / this.num;

    this.values = [];
    for(var i = 0; i < this.num; i++){
        var v = pts[i].value;
        if(v > 1){
            v = 1;
        } else if(v < 0){
            v = 0;
        }
        this.values.push({
            value1: v
        });
    }

    this.animate(duration, ease);
};

DrawBlocks.prototype.getContext = function(){
    return this.offscreen.getContext('2d');
};

DrawBlocks.prototype.drawBg = function(){
    var ctx = this.getContext();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.w, this.h);
};

DrawBlocks.prototype.drawLabel = function(){
    var ctx = this.getContext();

    var font = Math.floor(this.fontSize * this.dpr);
    ctx.font = 'normal ' + font + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#3C4F5E';
    ctx.strokeStyle = '#3C4F5E';
    ctx.lineWidth = 1 * this.dpr;

    var divA = 20 * this.dpr;
    var r = 5 * this.dpr;
    var divB = this.w * (50 / 750); // * this.dpr;

    for(var i = 0; i < this.values.length; i++){
        var y = (i + 0.5) * this.divY;
        ctx.fillText(this.pts[i].bottom, divB, y);
    }

    ctx.textAlign = 'right';
    for(var i = 0; i < this.values.length; i++){
        var y = (i + 0.5) * this.divY;
        ctx.fillText(this.pts[i].top, this.w - divB, (i + 0.5) * this.divY);
    }
};

DrawBlocks.prototype.drawShades = function(){
    var ctx = this.getContext();
    var color = '#E9EEF6';
    var barHeight = this.barHeight * this.dpr;
    var lineW = 1 * this.dpr;

    ctx.strokeStyle = '#979797';
    ctx.lineWidth = lineW;
    ctx.setLineDash([3 * this.dpr, 3 * this.dpr]);    //  清掉 dash
    ctx.beginPath();
    ctx.moveTo(this.w / 2, 0);  //this.divY * 0.2);
    ctx.lineTo(this.w / 2, this.h); //this.h - this.divY * 0.2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    for(var i = 0; i < this.values.length; i++){
        var y = (i + 0.5) * this.divY;
        var fromX = (this.w - this.barWidth) / 2;
        // var toX = (this.w + this.barWidth) / 2;
        // ctx.moveTo(fromX, y - barW);
        // ctx.fillRect(fromX, y - barHeight / 2, this.barWidth, barHeight);
        this.drawRoundRect(ctx, fromX, y - barHeight / 2, this.barWidth, barHeight, barHeight / 3, true, false);
    }

    ctx.setLineDash([]);    //  清掉 dash
};

/**
 * 绘制比例
 * @param p
 */
DrawBlocks.prototype.drawBars = function(p){
    var ctx = this.getContext();
    var barHeight = this.barHeight * this.dpr;
    var roundRadius = this.barHeight / 3;

    for(var i = 0; i < this.values.length; i++){
        var value = this.values[i];
        var boxW = (value.value1 > 0.5 ? 1 : -1) * this.barWidth / 2;
        var gradient = ctx.createLinearGradient(this.w / 2, 0, this.w / 2 + boxW, 0);
        gradient.addColorStop(0, '#4893FF');
        gradient.addColorStop(1, '#05F5FF');
        ctx.fillStyle = gradient;

        var y = (i + 0.5) * this.divY;
        var fromX = this.w / 2;
        var toX = this.w / 2 + this.p * this.barWidth * (value.value1 - 0.5);

        if(boxW > 0){
            this.drawRoundRect(ctx, fromX, y - barHeight / 2, (toX - fromX) * p, barHeight,
                {tl: 0, tr:roundRadius, bl:0, br: roundRadius}, true, false);
        }
        else if(boxW < 0){
            this.drawRoundRect(ctx, fromX - (fromX - toX) * p, y - barHeight / 2, (fromX - toX) * p, barHeight,
                {tl: roundRadius, tr:0, bl:roundRadius, br: 0}, true, false);
        }
    }
};

DrawBlocks.prototype.drawRoundRect = function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
};

/**
 * @param duration
 * @param ease
 */
DrawBlocks.prototype.animate = function(duration, ease){
    this.ease = ease;
    this.duration = duration;
    var i, j, p;
    //  如果是立刻到达的
    if(duration == 0){
        if(this.raf){  //   有动画, 取消动画
            window.cancelAnimationFrame(this.bindTick);
            this.raf = null;
        }

        //  应用当前的数据
        for(i = 0; i < this.pts.length; i++){
            p = this.pts[i];
            p.lastValue1 = this.valuesMe[i];
        }

        this.drawTick(1);
    }
    else{   //  有动画, 先把当前的值置过去
        if(!this.raf) { //  记录当前的信息
            if(!this.bindTick){
                this.bindTick = this.tick.bind(this);
            }

            this.timeStart = Date.now();
            this.timeElasped = 0;

            // console.log('start', this.timeStart, 'startTime=', this.timeElasped);
            this.raf = window.requestAnimationFrame(this.bindTick);
        }
        else{   //  如果有动画
            //  记录开始时间
            this.timeStart = Date.now();
            this.timeElasped = 0;
        }
    }
};

//  time 总的持续时间
DrawBlocks.prototype.tick = function(time){
    var t = Date.now() - this.timeStart;
    var delta = t - this.timeElasped;
//        console.log('t =', t, '; timestart=', this.timeStart);

    //  run redraw
    if(delta > 10){
        this.timeElasped = t;
        if(this.timeElasped > this.duration){
            window.cancelAnimationFrame(this.bindTick);
            this.raf = null;
            this.drawTick(1);
        }
        else{
            this.drawTick((this.timeElasped) / this.duration);
            this.raf = window.requestAnimationFrame(this.bindTick);
        }
    }
    else{
        this.raf = window.requestAnimationFrame(this.bindTick);
    }
};

DrawBlocks.prototype.drawTick = function(p){
    p = this.getEasedValue(p);

    this.getContext().clearRect(0, 0, this.w, this.h);
    this.drawLabel();
    this.drawShades();
    this.drawBars(p);
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.drawImage(this.offscreen, 0, 0);
};

//  获取缓动之后的值
DrawBlocks.prototype.getEasedValue = function(p){
    switch(this.ease){
        case 1:
            p = p < 0.5 ? 4 * p * p * p : (p - 1) * (2 * p - 2) * (2 * p - 2) + 1;
            break;
    }
    return p;
};

//  缓动类型
DrawBlocks.EASE_NONE = 0;
DrawBlocks.EASE_CUBIC_IN_OUT = 1;

export default DrawBlocks;
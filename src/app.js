"use strict";

require('../css/style.scss');

import rem from './rem';
import Tween from './tween';

//  calculate
rem.init(750);

var el = document.getElementById('elBox');
var el1 = document.getElementById('elBox1');
var onElChange = function () {
    // console.log('change...', el.x, el.y);
};

var onElComplete = function () {
    // console.log('complete...', el.x, el.y);
};

var a = {
    value: 100,
    print (a, b, c) {
        // console.log('print this', this, this.value);
        // console.log('print args', a, b, c)
    }
}

//  implement chain call
// var t = Tween.get(el, {onChange: onElChange, onComplete: onElComplete}).to({x: 100}, 3000, Tween.Ease.cubicInOut)
//     .to({y: 100}, 1000).to({x: 300, y: 230}, 3000, Tween.Ease.backInOut)
Tween.get('#elBox', {override:true, loop: true})
    .to({x: window.innerWidth / 2, y: window.innerHeight / 2}, 1000, Tween.Ease.cubicIn)
    .append({y: 300, rotation:90, scaleX: 0.5}, 1000, Tween.Ease.backInOut)
    .append({y: -300}, 1000, Tween.Ease.cubicInOut)
    .append({y: 200}, 1000, Tween.Ease.cubicInOut)
    .append({y: -200}, 1000, Tween.Ease.cubicInOut)
    .append({y: 100}, 1000, Tween.Ease.cubicInOut)
    .append({y: -100}, 1000, Tween.Ease.cubicInOut)
    .append({x: 300}, 1000, Tween.Ease.cubicInOut)
    .append({x: -200}, 1000, Tween.Ease.cubicInOut)
    .append({x: 100}, 1000, Tween.Ease.cubicInOut)
    .append({x: -50}, 1000, Tween.Ease.cubicInOut)
    .append({x: 0, y: 0, rotation: 90}, 2000, Tween.Ease.cubicInOut)
    .append({x: -80, y: 80, rotation: 180}, 1000, Tween.Ease.cubicInOut)
    .append({x: 60, y: -60, rotation: 270}, 1000, Tween.Ease.cubicInOut)
    .append({x: -40, y: 40, rotation: 360}, 1000, Tween.Ease.cubicInOut)

Tween.get('#block', {loop: true})
    .set({opacity: 1, scaleX:2, scaleY:0.5})
    .to({scale:1}, 3000)

Tween.get('#block')
    .set({x: 100, y: 50, opacity: 1, rotation: 30})

window['a'] = Tween

window.addEventListener('keydown', (e) => {
    switch(String.fromCharCode(e.keyCode).toLowerCase()) {
        case 'k':
            Tween.killAll()
            break;
        case 's':
            var x = Math.random() * window.innerWidth
            var y = Math.random() * window.innerHeight
            var d = Math.random() * 3000 + 1000
            Tween.get('#block', {override: true}).to({x: x, y: y, scaleX: Math.random(), scaleY: Math.random(), rotation: Math.random() * 360}, d, Tween.Ease.cubicInOut)
            t.append({x: getRandom(), y: getRandom()}, d, Tween.Ease.elasticInOut)
            break;
        case 'p':
            Tween.pauseAll()
            break
        case 'l':
            Tween.resumeAll()
            break
    }
})

var getRandom = function() {
    return 200 * (Math.random() - 0.5)
}

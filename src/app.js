"use strict";

require('../css/style.scss');

import rem from './rem';
import Tween from './tween';
import Ease from './ease';

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
var t = Tween.get(el, {onChange: onElChange, onComplete: onElComplete}).to({x: 100}, 3000, Ease.cubicInOut)
    .to({y: 100}, 1000).to({x: 300, y: 230}, 3000, Ease.backInOut)
Tween.get(el, {override:true}).to({y: 600}, 7000, Ease.backInOut);

// Animator.get(el1, {loop: false}).to({y:300, x: 123}, 3000, Ease.elasticInOut)
//     .wait(1000)
//     .call(a.print, a, [0, 1, 2])
//     .to({x: 300, y: 100}, 1000, Ease.circInOut);

window.addEventListener('keydown', (e) => {
    switch(String.fromCharCode(e.keyCode).toLowerCase()) {
        case 'k':
            Tween.kill(el1);
            console.log('kill tween!')
            break;
        case 's':
            var x = Math.random() * window.innerWidth
            var y = Math.random() * window.innerHeight
            var d = Math.random() * 3000 + 1000
            Tween.get('elBox1', {override: true}).to({x: x, y: y}, d, Ease.cubicInOut)
            t.to({x: x, y: y}, d, Ease.elasticInOut)
            console.log('start...', d)
            break;

    }
})
"use strict";

require('../css/style.scss');

import rem from './rem';
import Animator from './animator';
import Ease from './ease';
import Element from './element';

//  calculate
rem.init(750);

var el = new Element('elBox');
var onElChange = function () {
    // console.log(el.x, el.y);
};

window['a'] = el;

//  implement chain call
Animator.get(el, {onChange: onElChange}).to({x: 100}, 3000);
Animator.get(el, {onChange: onElChange}).to({y: 300}, 3000, Ease.backInOut);
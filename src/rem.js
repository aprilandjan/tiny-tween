/**
 * Created by Merlin on 16/8/16.
 */

//  带有一个px作为单位
var rem = {
    px: 1
};

rem.init = function(dw){
    dw = dw || 640;
    var vw = window.innerWidth;
    var calcREM = function () {
        rem.px = vw / dw;
        document.querySelector('html').style.fontSize = 100 * rem.px + 'px';
    };

    calcREM();
    window.addEventListener('resize', function () {
        calcREM();
    });
};

//  导出 rem
export default rem;
## Tiny Tween
> A tiny javascript Tween library, supplies fast tween on object prop values. 
Also Wrap up with HTMLElement with specific props such as ``x, y, scaleX, scaleX, scaleY, skewX, skewY, rotation, opacity` to make it useful when targeting html element.

> 极简的js 缓动类库, 提供对象属性值的快速缓动.
也对 HTMLElement 进行了封装, 提供这些元素基于 `x, y, scaleX, scaleX, scaleY, skewX, skewY, rotation, opacity` 等常用2D变换的快速缓动 

---

### API

- 引入

    ```javascript
    import Tween from './tween'
    ```

- ```get```, ```to```, ```append``` 创建实例&开启缓动&应用改变

    ```javascript
    var p = {x: 0, y: 0}
    var tween = Tween.get(p)
    tween.to({x: 100, y: 100}, 1000);   //  p = {x:100, y:100} after 1000ms
    tween.append({x:50, y: -50}, 1000);  //  p = {x:150, y:50} after 1000ms
    ```

- ```wait```, ```call```, ```set``` 等待&回调&设置

    ```javascript
    // 延迟1000ms执行后续缓动
    tween.wait(1000);    //  wait for 1000ms
    tween.to({x: 300, y: 300}, 1000);    //  tween to target state in 1000ms
    
    // call: 在下一帧执行自定义回调, 相当于 nextTick
    tween.call(()=>{
        console.log('finished!');   //  called when previous steps are done
    }
    
    // set: 将目标的属性立即设置为指定值。占用1帧
    tween.to({x:300, y: 300}, 1000).set({x: 100, y: 100});
    ```
    
- chained call 链式调用

    ```javascript
    Tween.get(p).to({x: 100, y: 100}, 1000).wait(300).call(()=>{
        console.log('now x=100, y=100!');
    }).to({x: 300, y: 300}).call(() => {
        console.log('now x=300, y=300!');
    });
    ```

- ```paused```, ```pausedAll``` 暂停/恢复缓动 (Todo)
    
    ```javascript
    var t = Tween.get(p).to({x:100, y:100}, 1000)
    
    //
    setTimeout(() => {
         t.paused = true // false
         Tween.pausedAll = true // false
    }, 500)
    
    ```

- ```kill```, ```killAll``` 移除缓动
    
    ```javascript
    Tween.get(p).to({x: 100, y: 100}, 1000);
    //  移除某目标的缓动
    Tween.kill(p)
    
    //  移除所有正在进行的缓动
    Tween.killAll()
    ```

- ```get``` 参数配置
    
    ```javascript
    var scope = {
        state: 'some props'
    }
    var config = {
        //  当该缓动序列结束时调用
        onComplete: function() { console.log(this.state) },
        //  结束回调的作用域
        onCompleteObj: scope,   
        //  当该缓动序列有属性值变更时调用
        onChange: function () { console.log(this.state) },
        //  变更回调的作用域
        onChangeObj: scope,
        //  是否覆盖之前的全部缓动, 避免同一个对象的多个缓动实例之间的干扰
        override: true,
        //  缓动是否循环
        loop: true
    }
    Tween.get(p, config).to({x: 100, y: 100}, 1000);
    ```

### HTMLElementWrapper

- 如果传入的对象是HTMLElement 或者是一个可以通过 ```document.querySelector``` 选择到的元素, 那么会使用 ```Element.get```包装起来, 然后使用具体属性名对其操作 
    
- 可以使用的属性有: 
    
    -  x 水平位移, 单位px
    -  y 垂直位移, 单位px
    -  scaleX 水平缩放
    -  scaleY 垂直缩放
    -  scale  总体缩放, 当设置此属性时, 等同于设置 scaleX/scaleY
    -  regX 水平注册中心
    -  regY 垂直注册中心
    -  rotation 旋转角度, 单位px
    -  opacity  透明度, 值域[0, 1]
    -  scrollY  垂直滚动位置
    
- 对同一个 HTMLElement, ```Tween``` 返回的是这个元素的单例

- 如需使用 ElementWrapper, 简单的通过 ```Tween.wrapper``` 获取单例并使用 ```validateNow()``` 来自定义属性值。

### Todo

- global pause

- ~~global kill~~

- alternative loop

- ~~html element wrapper~~
    - ~~transform~~
    - ~~opacity~~
    - ~~scale instead of scaleX scaleY, if scaleX != scaleY, then both of them animated to scale~~
## 简单的JS缓动
---
处理对象属性值的缓动类库。方便在 CommonJS 环境下使用

Thanks to createjs/Tweenjs!

---

### API

- 导入源码
    ```javascript
    import Animator from './animator'
    ```

- ```get```, `to` 创建实例&开启缓动
    ```javascript
    var p = {x: 0, y: 0}
    var anim = Animator.get(p)
    anim.to({x: 100, y: 100}, 1000);
    ```

- ```wait```, ```call``` 等待&回调
    ```javascript
    anim.wait(1000);    //  wait for 1000ms
    anim.to({x: 300, y: 300}, 1000);    //  tween to target state in 1000ms
    anim.call(()=>{
        console.log('finished!');   //  called when previous steps are done
    }
    ```
    
- chained call 链式调用
    ```javascript
    Animator.get(p).to({x: 100, y: 100}, 1000).wait(300).call(()=>{
        console.log('now x=100, y=100!');
    }).to({x: 300, y: 300}).call(() => {
        console.log('now x=300, y=300!');
    });
    ```

- ```kill``` 移除施加对象上的全部缓动
    ```javascript
    Animator.get(p).to({x: 100, y: 100}, 1000);
    Animator.kill(p)
    ```

- ```get``` configs
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
        override: true
    }
    Animator.get(p, config).to({x: 100, y: 100}, 1000);
    ```

### Todo
    
- global pause

- config: loop

- html element wrapper
## 简单的JS缓动
---
处理对象属性值的缓动类库

对 HTMLElement 进行封装, 通过修改这些元素的 `inline style(transform, opacity)`, 提供这些元素基于 `x, y, scaleX, scaleX, scaleY, skewX, skewY, rotation, opacity` 等常用2D变换的快速缓动 

---

### API

- 导入源码
    ```javascript
    import Tween from './tween'
    ```

- ```get```, `to` 创建实例&开启缓动
    ```javascript
    var p = {x: 0, y: 0}
    var tween = Tween.get(p)
    tween.to({x: 100, y: 100}, 1000);
    ```

- ```wait```, ```call``` 等待&回调
    ```javascript
    tween.wait(1000);    //  wait for 1000ms
    tween.to({x: 300, y: 300}, 1000);    //  tween to target state in 1000ms
    tween.call(()=>{
        console.log('finished!');   //  called when previous steps are done
    }
    ```
    
- chained call 链式调用
    ```javascript
    Tween.get(p).to({x: 100, y: 100}, 1000).wait(300).call(()=>{
        console.log('now x=100, y=100!');
    }).to({x: 300, y: 300}).call(() => {
        console.log('now x=300, y=300!');
    });
    ```

- ```kill``` 移除施加对象上的全部缓动
    ```javascript
    Tween.get(p).to({x: 100, y: 100}, 1000);
    Tween.kill(p)
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
        override: true,
        //  缓动是否循环
        loop: true
    }
    Tween.get(p, config).to({x: 100, y: 100}, 1000);
    ```

### HTMLElementWrapper

    - 如果传入的对象是HTMLElement or HTMLElementID, 那么会使用 ```Element.get```包装起来, 然后使用 x, y, alpha 等属性名对其进行操作 
    
    - 对同一个 HTMLElement, ```Tween``` 返回的是这个元素的单例

### Todo
    
- tween.set: bug when loop needs to be solved
    
- global pause

- global kill

- global kill & reset

- alternative

- html element wrapper
    - ~transform~
    - ~opacity~
    - scale instead of scaleX scaleY, if scaleX != scaleY, then both of them animated to scale
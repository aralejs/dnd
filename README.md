# Dnd

---

[![spm package](http://spmjs.io/badge/arale-dnd)](http://spmjs.io/package/arale-dnd)
[![Build Status](https://secure.travis-ci.org/aralejs/dnd.png)](https://travis-ci.org/aralejs/dnd)
[![Coverage Status](https://coveralls.io/repos/aralejs/dnd/badge.png?branch=master)](https://coveralls.io/r/aralejs/dnd)

Drap & Drop

## 配置说明

### 属性

#### element *element[Array]|selector*
可拖放的元素, 即源节点
>注: 支持多个元素, 非法时抛出异常

#### containment *element[Array]|selector|null*
拖放的边界, 默认为document
>注: 只取第一个元素, element初始必须要位于containment的内部

#### proxy *element[Array]|selector|null*
代理元素, 实际上跟随鼠标移动的元素, 默认null为源节点element的clone
>注: 只取选择器中的第一个元素

#### drops *element[Array]|selector|null*
可放置容器, 默认null为无
>注: 可以有多个元素

#### disabled *boolean*
是否禁止该元素拖放, 默认false为不禁止

#### visible *boolean*
被拖放的元素在源位置上是否可见, 默认false为不可见

#### axis *'x'|'y'|false*
拖放指定的方向, 默认false为任意方向

#### revert *boolean*
是否返回源节点初始位置, 默认false为不返回
>注: 当可放置容器不为null并且当前可放置容器为null时释放鼠标, 将返回源节点初始位置

#### revertDuration *number*
返回速度, 默认为500
>注: 源节点显示(visible = true)时, 拖放结束时移动到拖放位置的速度也取此值

#### draqCursor *string*
拖放过程中没进入放置容器drop时光标形状, 默认为"move"

#### dropCursor *string*
拖放过程中进入放置容器drop时光标的形状, 默认为"copy"

#### zIndex *number*
代理元素proxy拖放过程中的z-index, 默认为9999


### API

#### Dnd(element, config)
构造函数, element不能为空
>注: element为空会抛出异常, config应为简单对象

#### set(option, value)
设置配置属性, element不能设置
>注: 一切set设置应在拖放前

#### get(option)
获取配置属性
>注: 配置属性为DOM元素的, 均返回其jquery对象

#### open()
静态方法, 用Dnd直接调用, 开启页面的拖放功能
>注: 默认use dnd组件就自动open了

#### close()
静态方法, 用Dnd直接调用, 关闭页面的拖放功能


### 事件

#### dragstart (dataTransfer, proxy)
dataTransfer为拖放数据, proxy为代理元素(元素对象均为jquery对象); 拖放开始时
触发（按下鼠标并且至少移动1px),  常用来设置拖放数据dataTransfer
	
#### drag (proxy, drop)
proxy为代理元素, drop为当前可放置容器
拖放中一直触发, 直到鼠标释放
>注: drop有可能为空

#### dragenter (proxy, drop)
proxy为代理元素, drop为当前可放置容器
鼠标刚进入可放置容器中触发

#### dragover (proxy, drop)
proxy为代理元素, drop为当前可放置容器
鼠标在可放置容器中移动一直触发

#### dragleave (proxy, drop)
proxy为代理元素, drop为当前可放置容器
鼠标刚离开可放置容器时触发

#### drop (dataTransfer, proxy, drop)
proxy为代理元素, drop为当前可放置容器
鼠标在可放置容器中释放时触发, 常用来读取dataTransfer值

#### dragend (element, drop)
element为源节点元素, drop为当前可放置容器; 
拖放结束后触发, 常和dragleave处理相同, 用来取消dragenter中的设置
>注: 当没触发drop时, drop为null;


### data-attr实现拖放

#### 在data-attr上进行配置
data-dnd=true data-config为JSON字符串, 详细见演示
>注: 这种方式不支持dataTransfer和一系列事件, 只是简单拖放


## 最佳实践

带有语义(拖放数据)的拖放
```javascript
seajs.use(['dnd', '$'], function(Dnd, $){

    var proxy = document.createElement('img'),
        dnd = null ;

    $(proxy).on('load', function(){
        dnd = new Dnd('#drag', {
            drops: '#drop',
            proxy: proxy,
            visible: true, 
            revert: true
        }) ;

        // dataTransfer为拖放数据，传输信息
        dnd.on('dragstart', function(dataTransfer, proxy){
            dataTransfer.data = '玉伯也叫射雕' ;
        })
        dnd.on('dragenter', function(proxy, drop){
            drop.addClass('over') ;
        })
        dnd.on('dragleave', function(proxy, drop){
            drop.removeClass('over') ;
        })
        dnd.on('drop', function(dataTransfer, proxy, drop){
            if(typeof(dataTransfer.data) !== 'undefined'){
                drop.text(dataTransfer.data) ;
            }
        })
        dnd.on('dragend', function(element, drop){
            if(drop) drop.removeClass('over') ;
        })
    })
    $(proxy).css('width', 50) ;
    $(proxy).css('height', 50) ;
    proxy.src = 'http://tp3.sinaimg.cn/1748374882/180/40020642911/1' ;
});
```

用data-attr来实现的简单拖放
```html
<button data-dnd=true>I can drag</button>
```













































[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/aralejs/dnd/trend.png)](https://bitdeli.com/free "Bitdeli Badge")


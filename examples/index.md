# 演示文档

---

<style>
    .container {width:500px; height:200px; background:#CCC;}
    .drag {width:50px; height:50px; background:#07B1EE;}
    .over {border: 2px dashed #000;}
</style>


## 1. 带有边界的拖拽

<div id="container1" class="container">
    <div id="div1" class="drag"></div>
</div>
````javascript
seajs.use(['arale/dnd/1.0.0/dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#div1', {containment: '#container1'}) ;
});
````

## 2. 带有边界和方向的拖拽

<div id="container2" class="container">
    <div id="div2" class="drag"></div>
</div>
````javascript
seajs.use(['arale/dnd/1.0.0/dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#div2', {containment: '#container2', axis: 'x'}) ;
});
````


## 3. 带有返回且源节点不移动的拖拽

<div id="container3" class="container">
    <div id="div3" class="drag"></div>
</div>
````javascript
seajs.use(['arale/dnd/1.0.0/dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#div3', {containment: '#container3', revert: true, revertDuration: 600, visible: true}) ;
});
````

## 4. 带有代理元素和放置元素的拖放

<div id="div4" class="drag"></div>
<div id="drop1" class="container"></div>
````javascript
seajs.use(['arale/dnd/1.0.0/dnd', '$'], function(Dnd, $){
    var proxy = document.createElement('img') ;
    $(proxy).on('load', function(){
        dnd = new Dnd('#div4', {drop: '#drop1', proxy: proxy}) ;
    })
    proxy.width = 50 ;
    proxy.height = 50 ;
    proxy.src = 'http://tp3.sinaimg.cn/1748374882/180/40020642911/1' ;
});
````

## 5. 带有返回和处理事件的拖放

<div id="div5" class="drag"></div>
<div id="drop2" class="container"></div>
````javascript
seajs.use(['arale/dnd/1.0.0/dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#div5', {drop: '#drop2', revert: true}) ;
    
    // dataTransfer为拖放数据，传输信息
    dnd.on('dragstart', function(dataTransfer, dragging, dropping){
        dataTransfer.data = 'cjw replace' ;
    })
    dnd.on('dragenter', function(dragging, dropping){
        dropping.addClass('over') ;
    })
    dnd.on('dragleave', function(dragging, dropping){
        dropping.removeClass('over') ;
    })
    dnd.on('drop', function(dataTransfer, dragging, dropping){
        if(!$.isEmptyObject(dataTransfer) && typeof(dataTransfer.data) !== 'undefined'){
            dropping.text(dataTransfer.data) ;
        }
    })
    dnd.on('dragend', function(dragging, dropping){
        if(dropping) dropping.removeClass('over') ;
    })
});
````













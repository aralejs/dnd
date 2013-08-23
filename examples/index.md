# 演示文档

---


<style>
    .container {width:500px; height:200px; background:#CCC;}
    .drag {width:50px; height:50px; background:#07B1EE;}
    .over {border:2px dashed #000;}
</style>




## 1. 带有边界的拖放

````html
<div id="container1" class="container">
    <div id="drag1" class="drag"></div>
</div>
````

````javascript
seajs.use(['dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#drag1', {containment: '#container1'}) ;
});
````

## 2. 带有方向的拖放

````html
<div id="container2" class="container">
    <div id="drag2" class="drag"></div>
</div>
````

````javascript
seajs.use(['dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#drag2', {containment: '#container2', axis: 'x'}) ;
});
````


## 3. 带有返回且源节点不移动的拖放

````html
<div id="container3" class="container">
    <div id="drag3" class="drag"></div>
</div>
````

````javascript
seajs.use(['dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#drag3', {containment: '#container3', revert: true, revertDuration: 600, visible: true}) ;
});
````

## 4. 带有放置元素的拖放

````html
<div id="drag4" class="drag"></div>
<br />
<div id="drop1" class="container"></div>
````

````javascript
seajs.use(['dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#drag4', {drop: '#drop1'}) ;
});
````

## 5. 带有处理事件的拖放

````html
<div id="drag5" class="drag"></div>
<br />
<div id="drop2" class="container"></div>
````

````javascript
seajs.use(['dnd', '$'], function(Dnd, $){
    
    var proxy = document.createElement('img'),
        dnd = null ;
     
    $(proxy).on('load', function(){
        dnd = new Dnd('#drag5', {drop: '#drop2', proxy: proxy, visible: true, revert: true}) ;
        
        // dataTransfer为拖放数据，传输信息
        dnd.on('dragstart', function(dataTransfer, dragging, dropping){
            dataTransfer.data = '玉伯也叫射雕' ;
        })
        dnd.on('dragenter', function(dragging, dropping){
            dropping.addClass('over') ;
        })
        dnd.on('dragleave', function(dragging, dropping){
            dropping.removeClass('over') ;
        })
        dnd.on('drop', function(dataTransfer, dragging, dropping){
            if(typeof(dataTransfer.data) !== 'undefined'){
                dropping.text(dataTransfer.data) ;
            }
        })
        dnd.on('dragend', function(dragging, dropping){
            if(dropping) dropping.removeClass('over') ;
        })
    })
    $(proxy).css('width', 50) ;
    $(proxy).css('height', 50) ;
    proxy.src = 'http://tp3.sinaimg.cn/1748374882/180/40020642911/1' ;
});
````


##6. 利用data-attr来实现拖放

````html
<div id="drag6" class="drag" data-dnd=true 
data-config='{"drop": "#drop3", "zIndex": 99}'></div>
<br />
<div id="drop3" class="container"></div>
````

````javascript
seajs.use(['dnd', '$'], function(Dnd, $){
    $('#drag6').click(function(){
        // 修改配置, 注意要重置dnd为true
        $(this).data('dnd', true) ; // arale/dnd/1.0.0/dnd 应为 dnd
        $(this).data('config', null) ;
    }) ;
}) ;
````













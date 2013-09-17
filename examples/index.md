# 演示文档

---

<link href="http://assets.spmjs.org/alice/box/1.1.0/box.css" rel="stylesheet">
<style>
    .container {width:500px; height:200px; background:#CCC;}
    .drag {width:50px; height:50px; background:#07B1EE; position:relative;}
    .smalldrag {width:20px; height:20px; background:#fff; margin:auto; position:absolute; left:0; top:0; right:0; bottom:0;}
    .over {border:2px dashed #000;}
</style>




## 1. 带有边界的拖放

````html
<div id="container1" class="container">
    <div id="drag1" class="drag">
        <div class="smalldrag"></div>
    </div>
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
    <div id="drag2" class="drag">
         <div class="smalldrag"></div>
    </div>
</div>
````

````javascript
seajs.use(['dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#drag2', {containment: '#container2', axis: 'x'}) ;
});
````


## 3. 带有源节点显示的拖放

````html
<div id="container3" class="container">
    <div id="drag3" class="drag">
        <div class="smalldrag"></div>
    </div>
</div>
````

````javascript
seajs.use(['dnd', '$'], function(Dnd, $){
    var dnd = new Dnd('#drag3', {containment: '#container3', visible: true}) ;
});
````

## 4. 带有放置元素的拖放

````html
<div id="drag4" class="drag">
    <div class="smalldrag"></div>
</div>
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
<div id="drag5" class="drag">
    <div class="smalldrag"></div>
</div>
<br />
<div id="drop2" class="container"></div>
````

````javascript
seajs.use(['dnd', '$'], function(Dnd, $){
    
    var proxy = document.createElement('img'),
        dnd = null ;
     
    $(proxy).on('load', function(){
        dnd = new Dnd('#drag5', {drop: '#drop2', proxy: proxy, visible: true, 
              revert: true}) ;
        
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
data-config='{"drop": "#drop3", "zIndex": 99}'>
    <div class="smalldrag"></div>
</div>
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


##7. 和alice-box配合使用

````html
<div class="ui-box" data-dnd=true>
    <div class="ui-box-head">
        <h3 class="ui-box-head-title">区块标题</h3>
        <span class="ui-box-head-text">其他文字</span>
        <a href="#" class="ui-box-head-more">更多</a>
    </div>
    <div class="ui-box-container" data-dnd=false>
        <div class="ui-box-content">ui-box-content 有默认内边距</div>
    </div>
</div>
````

````javascript
seajs.use(['dnd', '$']) ;
````

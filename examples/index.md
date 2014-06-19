# 演示文档

---

<link href="http://assets.spmjs.org/alice/box/1.1.0/box.css" rel="stylesheet">
<style>
    .container {width:500px; height:200px; background:#CCC;}
    .drag {width:50px; height:50px; background:#07B1EE; position:relative;}
    .smalldrag {width:20px; height:20px; background:#fff; margin:auto; position:absolute; left:0; top:0; right:0; bottom:0;}
    .over {border:2px dashed #000;}
    #ex8 .drag {float:left; margin-left:20px; margin-bottom:10px;}
    #ex8 .container {clear:both; margin-top:5px;}
</style>
</style>




## 1. 带有边界的拖放

````html
<div id="ex1">
<div class="container">
    <div class="drag">
        <div class="smalldrag"></div>
    </div>
</div>
</div>
````

````javascript
seajs.use(['index', 'jquery'], function(Dnd, $) {
    var dnd = new Dnd('#ex1 .drag', {containment: '#ex1 .container'});
});
````

## 2. 带有方向的拖放

````html
<div id="ex2">
<div class="container">
    <div class="drag">
         <div class="smalldrag"></div>
    </div>
</div>
</div>
````

````javascript
seajs.use(['index', 'jquery'], function(Dnd, $) {
    var dnd = new Dnd('#ex2 .drag', {
        containment: '#ex2 .container',
        axis: 'x'
    });
});
````


## 3. 带有源节点显示的拖放

````html
<div id="ex3">
<div class="container">
    <div class="drag">
        <div class="smalldrag"></div>
    </div>
</div>
</div>
````

````javascript
seajs.use(['index', 'jquery'], function(Dnd, $) {
    var dnd = new Dnd('#ex3 .drag', {
        containment: '#ex3 .container',
        visible: true
    });
});
````

## 4. 带有放置元素的拖放

````html
<div id="ex4">
<div class="drag">
    <div class="smalldrag"></div>
</div>
<br />
<div class="container"></div>
</div>
````

````javascript
seajs.use(['index', 'jquery'], function(Dnd, $) {
    var dnd = new Dnd('#ex4 .drag', {drops: '#ex4 .container'});
});
````

## 5. 带有处理事件的拖放

````html
<div id="ex5">
<div class="drag">
    <div class="smalldrag"></div>
</div>
<br />
<div class="container"></div>
</div>
````

````javascript
seajs.use(['index', 'jquery'], function(Dnd, $) {
    
    var proxy = document.createElement('img');
    var dnd = null;
     
    $(proxy).on('load', function() {
        dnd = new Dnd('#ex5 .drag', {
            drops: '#ex5 .container',
            proxy: proxy,
            visible: true, 
            revert: true
        });
        
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
    $(proxy).css('width', 50);
    $(proxy).css('height', 50);
    proxy.src = 'http://tp3.sinaimg.cn/1748374882/180/40020642911/1';
});
````


##6. 利用data-attr来实现拖放

````html
<div id="ex6">
<div class="drag" data-dnd=true 
    data-config='{"drops": "#ex6 .container"}'>
    <div class="smalldrag"></div>
</div>
<br />
<div class="container"></div>
</div>
````

````javascript
seajs.use('index');
````


##7. 和alice-box配合使用

````html
<div id="ex7">
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
</div>
````

````javascript
seajs.use('index');
````

##8. 一次设置多个拖放元素

````html
<div id="ex8">
<div class="drag">
    <div class="smalldrag"></div>
</div>
<div class="drag">
    <div class="smalldrag"></div>
</div>
<div class="drag">
    <div class="smalldrag"></div>
</div>
<div class="drag">
    <div class="smalldrag"></div>
</div>
<div class="container"></div>
<div class="container"></div>
</div>
````

````javascript
seajs.use(['index', 'jquery'], function(Dnd, $) {
    var dnd = new Dnd('#ex8 .drag', {drops: '#ex8 .container'});
});
````

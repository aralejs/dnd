
define(function(require, exports, module){
    var Dnd ;
    
    var $ = require('$') ;
    var Base = require('base') ;
    
    /*
     * static private variable(module global varibale)
    */
    var draggingPre = false,  // 标识预拖放
        dragging = null,  // 标识当前拖放的代理元素
        dropping = null,  // 标识当前的目标元素
        diffX = 0,
        diffY = 0,   // diffX, diffY记录鼠标点击离源节点的距离
        obj = null,  // 存储当前拖放的dnd
        dataTransfer = {} ; // 存储拖放信息，在dragstart可设置，在drop中可读取
    
    /*
     * constructor function
    */
    Dnd = Base.extend({
        attrs: {
            element: {
                value: null,
                readOnly: true
            },
            containment: null,
            axis: false,
            visible: false,
            proxy: null,
            drop: null,
            revert: false,
            revertDuration: 500,
            disabled: false,
            dragCursor: 'move',
            dropCursor: 'copy'
        }, 
        
        initialize: function(elem, config){
            /* 
             * 检查源节点elem合法性
             * 初始化dnd
            */
            if($(elem).size() === 0){
                throw new Error('element error!') ;
            }
            if($.isPlainObject(config) === false){
                config = {} ;
            }
            config = $.extend(config, {element: $(elem).eq(0)}) ;
            Dnd.superclass.initialize.call(this, config) ;
            
            // 如果元素原始是relative，记录下left和top
            if(this.get('element').css('position') === 'relative'){
                this.get('element').data('drag-left',
                this.get('element').css('left')) ;
                this.get('element').data('drag-top',
                        this.get('element').css('top')) ;
            }
            
            // 在源节点上存储dnd
            this.get('element').data('dnd', this) ; 
        },
        
        /*
         * 拖放期间不能设置配置
        */
        set: function(option, value){
            if(obj !== this){
                Dnd.superclass.set.call(this, option, value) ;
            }
        },
        
        /*
         * 开启页面Dnd功能，绑定鼠标事件
        */
        open: function(){
            $(document).on('mousedown', handleDragEvent) ;
            $(document).on('mousemove', handleDragEvent) ;
            $(document).on('mouseup', handleDragEvent) ;
        },
        
        /*
         * 关闭页面Dnd功能，解绑鼠标事件
        */
        close: function(){
            $(document).off('mousedown', handleDragEvent) ;
            $(document).off('mousemove', handleDragEvent) ;
            $(document).off('mouseup', handleDragEvent) ;
        }
    }) ;
    
    /*-----------------------static private function--------------------*/
    
    /* 
     * 核心部分，处理鼠标事件，实现拖放逻辑
    */
    function handleDragEvent(event){
        switch(event.type){
            case 'mousedown':
                
                // 鼠标左键按下并且是可移动元素
                if(event.which === 1 &&
                        $(event.target).data('dnd') instanceof Dnd){
                    
                    // 取得elemenet上的dnd
                    var dnd = $(event.target).data('dnd') ;
                    
                    // 源节点不允许拖放则返回
                    if(dnd.get('disabled') === true) return ;
                    
                    /*
                     * 处理配置合法性
                     * 使dnd对象赋给对象obj
                     * 记录点击距源节点距离
                    */
                    handleConfig(dnd) ;
                    obj = dnd ;
                    diffX = event.pageX - obj.get('element').offset().left ;
                    diffY = event.pageY - obj.get('element').offset().top ;
                    
                    // draggingpre主要是防止用户点击而不是拖放
                    draggingPre = true ;
                    
                    // 阻止 默认光标和选中文本
                    event.preventDefault() ;
                }
                break ;
            
            case 'mousemove':
                if(draggingPre !== false){
                    
                    // 开始拖放
                    executeDragStart() ;
                }
                if(dragging !== null){
                    
                    // 根据边界和方向一起判断是否drag并执行
                    executeDrag({pageX: event.pageX, pageY: event.pageY}) ;
                    
                    // 根据dragging和dropping位置来判断
                    // 是否要dragenter, dragleave和dragover并执行
                    executeDragEnterLeaveOver() ;
                    
                    // 阻止 默认光标和选中文本
                    event.preventDefault() ;
                }
                break ;
            
            case 'mouseup':
                if(dragging !== null){
                    dragging = null ;
                    
                    // 根据dropping判断是否drop并执行
                    executeDrop() ;
                    
                    // 根据revert判断是否要返回并执行
                    executeRevert() ;
                    
                    // 此处传递的dragging为源节点element
                    obj.trigger('dragend', obj.get('element'), dropping) ;
                    obj = null ;
                    dropping = null ;
                }
                else if(draggingPre === true){
                       
                    // 点击而非拖放时
                    obj.get('proxy').remove() ;
                    draggingPre = false ;
                    obj = null ;
                }
                break ;
        }
    }
    
    /*
     * 显示proxy， 按照设置显示或隐藏源节点element
     * 开始拖放
    */
    function executeDragStart(){
        
        // 按照设置显示或隐藏element
        if(obj.get('visible') === false){
            obj.get('element').css('visibility', 'hidden') ;
        }
        obj.get('proxy').css('visibility', 'visible') ;
        obj.get('proxy').css('cursor', obj.get('dragCursor')) ;
        
        dataTransfer = {} ;
        draggingPre = false ;
        dragging = obj.get('proxy') ;
        obj.trigger('dragstart', dataTransfer, dragging, dropping) ;
    }
    
    /*
     * 根据边界和方向一起判断是否drag并执行
    */
    function executeDrag(event){
        var container = obj.get('containment') ;
        
        // 是否在x方向上移动并执行
        if(obj.get('axis') !== 'y'){
            if(container === null ||
                    isContain(container, event.pageX - diffX,
                    dragging.offset().top, dragging.outerWidth(), 
                    dragging.outerHeight())){
                dragging.css('left', event.pageX - diffX) ;
            }
            else{
                if(event.pageX - diffX <= container.offset().left){
                    dragging.css('left', container.offset().left) ;
                } 
                else{
                    dragging.css('left', container.offset().left +
                            container.innerWidth() - dragging.outerWidth()) ;
                }
            }
        }
        
        // 是否在y方向上移动并执行
        if(obj.get('axis') !== 'x'){
            if(container === null ||
                    isContain(container, dragging.offset().left,
                    event.pageY - diffY, dragging.outerWidth(),
                    dragging.outerHeight())){
                dragging.css('top', event.pageY - diffY) ;
            }
            else{
                if(event.pageY - diffY <= container.offset().top){
                    dragging.css('top', container.offset().top) ;
                } 
                else{
                    dragging.css('top', container.offset().top +
                            container.innerHeight() - dragging.outerHeight()) ;
                }
            }
        }
        
        obj.trigger('drag', dragging, dropping) ;
    }
    
    /*
     * 根据dragging和dropping位置来判断是否要dragenter，dragleave和dragover并执行
    */
    function executeDragEnterLeaveOver(){
        if(obj.get('drop') !== null){
            if(dropping === null){
                $.each(obj.get('drop'), function(index, elem){
                    
                    // 注意检测drop不是element或者proxy本身
                    if(elem !== obj.get('element').get(0) &&
                            elem !== dragging.get(0) &&
                            isContain(elem, dragging.offset().left + diffX, 
                            dragging.offset().top + diffY)){
                        dropping = $(elem) ;
                        dragging.css('cursor', obj.get('dropCursor')) ;
                        obj.trigger('dragenter', dragging, dropping) ;
                        return ;
                    }
                }) ;
            } 
            else{
                if(!isContain(dropping, dragging.offset().left + diffX,
                        dragging.offset().top + diffY)){
                    dragging.css('cursor', obj.get('dragCursor')) ;
                    obj.trigger('dragleave', dragging, dropping) ;
                    dropping = null ;
                }
                else{
                    obj.trigger('dragover', dragging, dropping) ;
                }
            }
        }
    }
    
    /*
     * 根据dropping判断是否drop并执行
     * 当dragging不在dropping内且不需要revert时，将dragging置于dropping中央
    */
    function executeDrop(){
        var xdragging = obj.get('proxy') ;
        
        if(dropping !== null){
            
            // 放置时不完全在drop中并且不需要返回的放置中央
            if(!isContain(dropping, xdragging) && obj.get('revert') === false){
                xdragging.css('left', dropping.offset().left +
                        (dropping.innerWidth() -
                        xdragging.outerWidth()) / 2) ;
                xdragging.css('top', dropping.offset().top +
                        (dropping.innerHeight() -
                        xdragging.outerHeight()) / 2) ;
            }
            
            // 此处传递的dragging为源节点element
            obj.trigger('drop', dataTransfer, obj.get('element'), dropping) ;
        }
    }
    
    /*
     * 根据revert判断是否要返回并执行
     * 若有指定放置元素且dropping为null，则自动回到原处
    */
    function executeRevert(){
        var xdragging = obj.get('proxy'),
            xleft = 0,
            xtop = 0 ;
        
        // 恢复光标
        xdragging.css('cursor', 'default') ;
        
        if(obj.get('revert') === true ||
                (dropping === null && obj.get('drop') !== null)){
            
            /* 
             * 代理元素返回源节点处
            */
            if(typeof(obj.get('element').data('drag-left')) !== 'undefined'){
                xleft = obj.get('element').data('drag-left') ;
                xtop = obj.get('element').data('drag-top') ;
            }
            else{
                xleft = 0 ;
                xtop = 0 ;
            }
            obj.get('element').css('left', xleft) ;
            obj.get('element').css('top', xtop) ;
            
            // obj 可能已经设置为空，所以应先赋给dnd，用于回调
            var dnd = obj ;
            
            xdragging.animate({left: obj.get('element').offset().left,
                    top: obj.get('element').offset().top},
                    obj.get('revertDuration'), function(){
                
                // 显示源节点 移除代理元素
                dnd.get('element').css('visibility', 'visible') ;
                xdragging.remove() ;
            }) ;
        }
        else{
            
            /* 
             * 源节点移动到代理元素处
            */
            xleft = xdragging.offset().left - obj.get('element').offset().left ;
            xtop = xdragging.offset().top -  obj.get('element').offset().top ;
            if(obj.get('element').css('position') === 'relative'){
                obj.get('element').css('left', 
                        (isNaN(parseInt(obj.get('element').css('left'))) ? 0 : 
                        parseInt(obj.get('element').css('left'))) + xleft) ;
                obj.get('element').css('top',
                        (isNaN(parseInt(obj.get('element').css('top'))) ? 0 : 
                        parseInt(obj.get('element').css('top'))) + xtop) ;
            }
            else{
                obj.get('element').css('position', 'relative') ;
                obj.get('element').css('left', xleft) ;
                obj.get('element').css('top', xtop) ;
            }
            
            // 显示源节点 移除代理元素
            obj.get('element').css('visibility', 'visible') ;
            xdragging.remove() ;
        }
    }
    
    
    /*--------------some useful static private function----------------*/
    
    /*
     * 判断点元素B是否位于元素A内部 or 
     * 点(B, C)是否位于A内 or
     * (B, C)width=D,height=F是否位于A内
     * 1.5是为了补全浏览器间的浮点数运算差异
    */
    function isContain(A, B, C, D, F){
        var x = 0, y = 0, width = 0, height = 0;
        
        if(arguments.length == 2){
            return $(A).offset().left - 1.5 <= $(B).offset().left && 
                    $(A).offset().left + $(A).innerWidth() >= 
                    $(B).offset().left + $(B).outerWidth() - 1.5 &&
                    $(A).offset().top - 1.5 <= $(B).offset().top && 
                    $(A).offset().top + $(A).innerHeight() >=
                    $(B).offset().top + $(B).outerHeight() - 1.5 ;
        }
        
        if(arguments.length == 3){  
            x = B, y = C ;
            return $(A).offset().left - 1.5 <= x &&
                    $(A).offset().left + $(A).innerWidth() >= x - 1.5 &&
                    $(A).offset().top - 1.5 <= y &&
                    $(A).offset().top + $(A).innerHeight() >= y - 1.5 ;
        }
        
        if(arguments.length == 5){
            x = B, y = C, width = D, height = F ;
            return $(A).offset().left - 1.5 <= x &&
                    $(A).offset().left + $(A).innerWidth() >= x + width - 1.5 &&
                    $(A).offset().top - 1.5 <= y &&
                    $(A).offset().top + $(A).innerHeight() >= y + height - 1.5 ;
        }
    }
    
    /*
     * 检查配置合法性
     * 不合法的配置采用默认配置
     * 每次拖放时都检查一次，防止用户修改配置
    */
    function handleConfig(dnd){
        var option = '',
            element = dnd.get('element'),
            value = null ;
        
        for(option in dnd.attrs){
            value = dnd.get(option) ;
            
            switch(option){
                case 'containment':
                    
                    // containment不能为element本身
                    // element也不能在containment外
                    if($(value).size() === 0 ||
                            $(value).get(0) === element.get(0) ||
                            !isContain($(value).eq(0), element)){
                        dnd.set('containment', null) ;
                    }
                    else{
                        dnd.set('containment',
                                $(dnd.get('containment')).eq(0)) ;
                    }
                    break ;
                case 'axis':
                    if(value !== 'x' && value !== 'y' && value !== false){
                        dnd.set('axis', false) ;
                    }
                    break ;
                case 'visible':
                    if(typeof(value) !== 'boolean'){
                        dnd.set('visible', false) ;
                    }
                    break ;
                case 'proxy':
                    
                    // proxy不能为element本身, 也不能为containment
                    if($(value).size() === 0 ||
                            $(value).get(0) === element.get(0) ||
                            $(value).get(0) ===
                            $(dnd.get('containment')).get(0)){
                        dnd.set('proxy', dnd.get('element').clone()) ;
                    }
                    else{
                        dnd.set('proxy', $(dnd.get('proxy')).eq(0)) ;
                    }
                    
                    /*
                     * 设置proxy并插入文档
                    */
                    var proxy = dnd.get('proxy') ;
                    proxy.css('position', 'absolute') ;
                    proxy.css('margin', '0') ;
                    proxy.css('left', dnd.get('element').offset().left) ;
                    proxy.css('top', dnd.get('element').offset().top) ;
                    proxy.css('visibility', 'hidden') ;
                    proxy.appendTo('body') ;
                    break ;
                case 'drop':
                    if($(value).size() === 0){
                        dnd.set('drop', null) ;
                    }
                    else{
                        dnd.set('drop', $(dnd.get('drop'))) ;
                    }
                    break ;
                case 'revert':
                    if(typeof(value) !== 'boolean'){
                        dnd.set('revert', false) ;
                    }
                    break ;
                case 'revertDuration':
                    if(typeof(value) !== 'number'){
                        dnd.set('revertDuration', 500) ;
                    }
                    break ;
                case 'disabled':
                    if(typeof(value) !== 'boolean'){
                        dnd.set('disabled', false) ;
                    }
                    break ;
                case 'dragCursor':
                    if(typeof(value) !== 'string'){
                        dnd.set('dragCursor', 'move') ;
                    }
                    break ;
                case 'dropCursor':
                    if(typeof(value) !== 'string'){
                        dnd.set('dropCursor', 'copy') ;
                    }
                    break ;
            }
        }
    }
    
    Dnd.prototype.open() ;
    module.exports = Dnd ;
}) ;

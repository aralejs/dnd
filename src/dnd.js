
define(function(require, exports, module){
    var Dnd = null ;
    
    var $ = require('$'),
        Base = require('base') ;
    
    /*
     * static private variable(module global varibale)
    */
    var draggingPre = false, // 标识预拖放
        dragging = null, // 标识当前拖放的代理元素
        dropping = null, // 标识当前的目标元素
        diffX = 0,
        diffY = 0, // diffX, diffY记录鼠标点击离源节点的距离
        obj = null, // 存储当前拖放的dnd
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
        var dnd = null ;
        
        switch(event.type){
            case 'mousedown':
                
                // 鼠标左键按下并且是可移动元素
                if(event.which === 1 &&
                        $(event.target).data('dnd') instanceof Dnd){
                    
                    // 取得elemenet上的dnd
                    dnd = $(event.target).data('dnd') ;
                    
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
                    
                    // 恢复光标
                    dragging.css('cursor', 'default') ;
                    dragging.focus() ;
                    
                    dragging = null ;
                    
                    // 根据dropping判断是否drop并执行
                    executeDrop() ;
                    
                    // 根据revert判断是否要返回并执行
                    executeRevert() ;
                    
                    // 此处传递的dragging为源节点element
                    obj.trigger('dragend', obj.get('element'), dropping) ;
                    obj = null ;
                    dropping = null ;
                } else if(draggingPre === true){
                       
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
        var element = obj.get('element'),
            proxy = obj.get('proxy'),
            visible = obj.get('visible'),
            dragCusor = obj.get('dragCursor') ;
        
        // 按照设置显示或隐藏element
        if(visible === false){
            element.css('visibility', 'hidden') ;
        }
        proxy.css('visibility', 'visible') ;
        proxy.css('cursor', dragCusor) ;
        proxy.focus() ;
        
        dataTransfer = {} ;
        draggingPre = false ;
        dragging = proxy ;
        obj.trigger('dragstart', dataTransfer, dragging, dropping) ;
    }
    
    /*
     * 根据边界和方向一起判断是否drag并执行
    */
    function executeDrag(event){
        var container = obj.get('containment'),
            axis = obj.get('axis'),
            xleft = event.pageX - diffX,
            xtop = event.pageY - diffY ;
        
        // 是否在x方向上移动并执行
        if(axis !== 'y'){
            if(container === null || 
                    (xleft >= container.offset().left &&
                    xleft + dragging.outerWidth() <= container.offset().left +
                    container.outerWidth())){
                dragging.css('left', xleft) ;
            } else{
                if(xleft <= container.offset().left){
                    dragging.css('left', container.offset().left) ;
                } else{
                    dragging.css('left', 
                            container.offset().left + container.outerWidth() -  
                            dragging.outerWidth()) ;
                }
            }
        }
        
        // 是否在y方向上移动并执行
        if(axis !== 'x'){
            if(container === null || 
                    (xtop >= container.offset().top &&
                    xtop + dragging.outerHeight() <= container.offset().top +
                    container.outerHeight())){
                dragging.css('top', xtop) ;
            } else{
                if(xtop <= container.offset().top){
                    dragging.css('top', container.offset().top) ;
                } else{
                    dragging.css('top', 
                            container.offset().top + container.outerHeight() -  
                            dragging.outerHeight()) ;
                }
            }
        }
           
        obj.trigger('drag', dragging, dropping) ;
    }
    
    /*
     * 根据dragging和dropping位置来判断是否要dragenter，dragleave和dragover并执行
    */
    function executeDragEnterLeaveOver(){
        var element = obj.get('element'),
            drop = obj.get('drop'),
            dragCursor = obj.get('dragCursor'),
            dropCursor = obj.get('dropCursor'),
            xleft = 0,
            xtop = 0 ;
        
        if(drop !== null){
            xleft = dragging.offset().left + diffX ;
            xtop = dragging.offset().top + diffY ;
                        
            if(dropping === null){
                $.each(drop, function(index, elem){
                    
                    // 注意检测drop不是element或者proxy本身
                    if(elem !== element.get(0) &&
                            elem !== dragging.get(0) &&
                            isContain(elem, xleft, xtop)){
                        dragging.css('cursor', dropCursor) ;
                        dragging.focus() ;
                        
                        dropping = $(elem) ;
                        obj.trigger('dragenter', dragging, dropping) ;
                        return ;
                    }
                }) ;
            } else{
                if(!isContain(dropping, xleft, xtop)){
                    dragging.css('cursor', dragCursor) ;
                    dragging.focus() ;
                    
                    obj.trigger('dragleave', dragging, dropping) ;
                    dropping = null ;
                } else{
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
        var element = obj.get('element'),
            xdragging = obj.get('proxy'),
            revert = obj.get('revert') ;
        
        if(dropping !== null){
            
            // 放置时不完全在drop中并且不需要返回的放置中央
            if(!isContain(dropping, xdragging) && revert === false){
                xdragging.css('left', dropping.offset().left +
                        (dropping.outerWidth() -
                        xdragging.outerWidth()) / 2) ;
                xdragging.css('top', dropping.offset().top +
                        (dropping.outerHeight() -
                        xdragging.outerHeight()) / 2) ;
            }
            
            // 此处传递的dragging为源节点element
            obj.trigger('drop', dataTransfer, element, dropping) ;
        }
    }
    
    /*
     * 根据revert判断是否要返回并执行
     * 若有指定放置元素且dropping为null，则自动回到原处
    */
    function executeRevert(){
        var element = obj.get('element'),
            xdragging = obj.get('proxy'),
            drop = obj.get('drop'),
            revert = obj.get('revert'),
            revertDuration = obj.get('revertDuration'),
            xleft = 0,
            xtop = 0 ;
        
        if(revert === true ||
                (dropping === null && drop !== null)){
            
            /* 
             * 代理元素返回源节点处
            */
            if(typeof(element.data('drag-left')) !== 'undefined'){
                xleft = element.data('drag-left') ;
                xtop = element.data('drag-top') ;
            } else{
                xleft = 0 ;
                xtop = 0 ;
            }
            if(element.css('position') === 'relative'){
                element.css('left', xleft) ;
                element.css('top', xtop) ;
            }
            
            xdragging.animate({left: element.offset().left,
                    top: element.offset().top},
                    revertDuration, function(){
                
                // 显示源节点 移除代理元素
                element.css('visibility', '') ;
                xdragging.remove() ;
            }) ;
        } else{
            
            /* 
             * 源节点移动到代理元素处
            */
            xleft = xdragging.offset().left - element.offset().left ;
            xtop = xdragging.offset().top -  element.offset().top ;
            if(element.css('position') === 'relative'){
                element.css('left', 
                        (isNaN(parseInt(element.css('left'))) ? 0 : 
                        parseInt(element.css('left'))) + xleft) ;
                element.css('top',
                        (isNaN(parseInt(element.css('top'))) ? 0 : 
                        parseInt(element.css('top'))) + xtop) ;
            } else{
                element.css('position', 'relative') ;
                element.css('left', xleft) ;
                element.css('top', xtop) ;
            }
            
            // 显示源节点 移除代理元素
            element.css('visibility', '') ;
            xdragging.remove() ;
        }
    }
    
    /*
     * 检查配置合法性
     * 不合法的配置采用默认配置
     * 每次拖放时都检查一次，防止用户修改配置
    */
    function handleConfig(dnd){
        var element = dnd.get('element'),
            proxy = null,
            option = '',
            value ;
        
        for(option in dnd.attrs){
            if(dnd.attrs.hasOwnProperty(option) === false){
                continue ;
            }
            value = dnd.get(option) ;
            
            switch(option){
                case 'containment':
                    
                    // containment不能为element本身
                    // element也不能在containment外
                    if($(value).size() === 0 ||
                            $(value).get(0) === element.get(0) ||
                            !isContain($(value).eq(0), element, 1.0)){
                        dnd.set('containment', null) ;
                    } else{
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
                        dnd.set('proxy', element.clone()) ;
                    } else{
                        dnd.set('proxy', $(dnd.get('proxy')).eq(0)) ;
                    }
                    
                    /*
                     * 设置proxy并插入文档
                     * 若在mouseover中插入，会造成抖动
                    */
                    proxy = dnd.get('proxy') ;
                    proxy.css('position', 'absolute') ;
                    proxy.css('margin', '0') ;
                    proxy.css('left', element.offset().left) ;
                    proxy.css('top', element.offset().top) ;
                    proxy.css('visibility', 'hidden') ;
                    proxy.appendTo('body') ;
                    break ;
                
                case 'drop':
                    if($(value).size() === 0){
                        dnd.set('drop', null) ;
                    } else{
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
    
    /*
     * 判断元素B是否位于元素A内部 or 点(B, C)是否位于A内
     * error为了补全IE9,IE10对offset浮点值的差异, 
     * 目前只是在判断container是否合法时使用error=1.0
    */
    function isContain(A, B, C){
        var error = C ;
        
        if(typeof(B) === 'object'){
            if(typeof(error) !== 'number'){
                error = 0 ;
            }
            return $(A).offset().left - error <= $(B).offset().left &&
                    $(A).offset().left + $(A).outerWidth() >= 
                    $(B).offset().left + $(B).outerWidth() - error &&
                    $(A).offset().top - error <= $(B).offset().top && 
                    $(A).offset().top + $(A).outerHeight() >=
                    $(B).offset().top + $(B).outerHeight() ;
        }
        if(typeof(B) === 'number' && typeof(C) === 'number'){  
            return $(A).offset().left <= B &&
                    $(A).offset().left + $(A).outerWidth() >= B &&
                    $(A).offset().top <= C &&
                    $(A).offset().top + $(A).outerHeight() >= C ;
        }
    }
    
    Dnd.prototype.open() ;
    module.exports = Dnd ;
}) ;

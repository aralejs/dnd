
define(function(require, exports, module){
	var Dnd ;
	
	var $ = require('$') ;
	var Base = require('base') ;
	
	// static private variable(module global varibale)
	var draggingPre = false,  // 标识预拖拽，鼠标点击可拖拽元素
		dragging = null,  // 标识当前的拖拽元素
		dropping = null,  // 标识当前的目标元素
		diffX = 0,
		diffY = 0,   // diffX, diffY记录鼠标离拖拽元素的距离
		obj = null,  // 存储当前拖放的dnd instance
		dataTransfer = {}, // 存储拖放信息 在dragstart可设置 在drop中可读取
	
	// constructor function
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
			// 检查参数合法性
			handleArgument(elem, config) ;
			config = $.extend(config, {element: $(elem).eq(0)}) ;
			Dnd.superclass.initialize.call(this, config) ;
			// 如果元素原始是relative 记录下left和top
			if(this.get('element').css('position') === 'relative'){
				this.get('element').data('drag-left', this.get('element').css('left')) ;
				this.get('element').data('drag-top', this.get('element').css('top')) ;
			}
			// store instance
			this.get('element').data('dnd', this) ;	
		}
	}) ;
	
	/*----------------------------------------static public function----------------------------------------------------*/
	// 开启页面Dnd功能，绑定鼠标事件
	Dnd.prototype.open = function(){
		$(document).on('mousedown', handleDragEvent) ;
		$(document).on('mousemove', handleDragEvent) ;
		$(document).on('mouseup', handleDragEvent) ;	
	} ;


	// 关闭页面Dnd功能，解绑鼠标事件
	Dnd.prototype.close = function(){
		$(document).off('mousedown', handleDragEvent) ;
		$(document).off('mousemove', handleDragEvent) ;
		$(document).off('mouseup', handleDragEvent) ;
	} ;
	
	/*---------------------------------static private function----------------------------------------------------------*/
	// 核心部分，处理鼠标事件，实现拖放逻辑
	function handleDragEvent(event){
		switch(event.type){
			case 'mousedown':
				// 鼠标左键按下并且是可移动元素
				if(event.which === 1 &&  $(event.target).data('dnd') instanceof Dnd){
					// 使源节点的信息对象赋给对象obj
					obj = $(event.target).data('dnd') ;
					// 源节点设置不允许拖放
					if(obj.get('disabled') === true) return ;
					// 设置proxy, container, drop, diff
					executeDragPre() ;
					// 阻止默认光标
					event.preventDefault();
				}
				break ;
			
			case 'mousemove':
				// 开始拖放, 设置dragging
				executeDragStart() ;
				if(dragging){
					// 根据边界和方向一起判断是否drag并执行
					executeDrag({pageX: event.pageX, pageY: event.pageY}) ;
					// 根据dragging来判断要dragenter和dragleave并执行 不能用event.pageX因为要防止源节点受边界或方向限制没有被拖动
					executeDragEnterLeave() ;
				}
				break ;
			
			case 'mouseup':
				if(dragging){
					// 设置dragging为null 防止处理drop时mousemove
					dragging = null ;
					// 根据dropping判断是否drop并执行
					executeDrop() ;
					// 根据revert判断是否要返回并执行(若指定放置元素且没drop则自动回到原处与revert设置无关)
					executeRevert() ;
					// 触发dragend
					obj.trigger('dragend', obj.get('element'), dropping) ;
					dropping = null ;
				}
				else if(draggingPre){    
					// 点击而非拖拽时
					obj.get('element').css('visibility', 'visible') ;
					obj.get('proxy').remove() ;
					draggingPre = false ;
				}
				break ;
		}
	}
	
	// 设置proxy, container, drop, diff
	function executeDragPre(){
		// 设置代理元素proxy并且插入DOM   proxy插入DOM若放在movemove中处理会产生抖动
		if(obj.get('proxy') === null){
			obj.set('proxy', obj.get('element').clone()) ;
		}
		else{
			obj.set('proxy', $(obj.get('proxy'))) ;
		}
		var proxy = obj.get('proxy') ;
		proxy.css('position', 'absolute') ;
		proxy.css('margin', '0') ;
		proxy.css('cursor', obj.get('dragCursor')) ;
		proxy.css('left', obj.get('element').offset().left) ;
		proxy.css('top', obj.get('element').offset().top) ;
		proxy.css('visibility', 'hidden') ;
		proxy.appendTo('body') ;
		// 记录点击距源节点距离
		diffX = event.pageX - obj.get('element').offset().left ;
		diffY = event.pageY - obj.get('element').offset().top ;
		// draggingpre主要是防止用户点击而不是拖拽
		draggingPre = true ;
	}
	
	// 开始拖放, 设置dragging
	function executeDragStart(){
		if(draggingPre !== false){
			// 设置container, drop
			obj.set('containment', obj.get('containment') === null ? null : $(obj.get('containment'))) ;
			obj.set('drop', obj.get('drop') === null ? null : $(obj.get('drop'))) ;
			// 按照设置显示或隐藏
			if(!obj.get('visible')){
				obj.get('element').css('visibility', 'hidden') ;
			}
			obj.get('proxy').css('visibility', 'visible') ;
			// 设置dataTransfer
			dataTransfer = {} ;
			// 设置dragging为proxy
			draggingPre = false ;
			dragging = obj.get('proxy') ;
			// 触发拖放开始
			obj.trigger('dragstart', dataTransfer, dragging, dropping) ;
		}
	}
	
	// 根据边界和方向一起判断是否drag并执行
	function executeDrag(event){
		var container = obj.get('containment') ;
		if(obj.get('axis') !== 'y'){
			if(container === null || isContain(container, event.pageX - diffX, dragging.offset().top, dragging.outerWidth(), dragging.outerHeight())){
				dragging.css('left', event.pageX - diffX) ;
			}
			else{
				if(event.pageX - diffX <= container.offset().left){
					dragging.css('left', container.offset().left) ;
				} 
				else{
					dragging.css('left', container.offset().left + container.innerWidth() - dragging.outerWidth()) ;
				}
			}
		}
		if(obj.get('axis') !== 'x'){
			if(container === null || isContain(container, dragging.offset().left, event.pageY - diffY, dragging.outerWidth(), dragging.outerHeight())){
				dragging.css('top', event.pageY - diffY) ;
			}
			else{
				if(event.pageY - diffY <= container.offset().top){
					dragging.css('top', container.offset().top) ;
				} 
				else{
					dragging.css('top', container.offset().top + container.innerHeight() - dragging.outerHeight()) ;
				}
			}
		}
		obj.trigger('drag', dragging, dropping) ;
	}
	
	// 根据dragging来判断要dragenter和dragleave并执行 不能用event.pageX因为要防止源节点受边界或方向限制没有被拖动
	function executeDragEnterLeave(){
		if(obj.get('drop') !== null){
			if(dropping === null){
				$.each(obj.get('drop'), function(index, elem){
					if(isContain(elem, dragging.offset().left + diffX, dragging.offset().top + diffY)){
						dropping = $(elem) ;
						dragging.css('cursor', obj.get('dropCursor')) ;
						obj.trigger('dragenter', dragging, dropping) ;
						return ;
					}
				}) ;
			} 
			else{
				if(!isContain(dropping, dragging.offset().left + diffX, dragging.offset().top + diffY)){
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
	
	// 根据dropping判断是否drop并执行
	function executeDrop(){
		var xdragging = obj.get('proxy') ;
		// 恢复光标
		xdragging.css('cursor', 'default') ;
		if(dropping){
			if(!isContain(dropping, xdragging)){
				xdragging.css('left', dropping.offset().left + (dropping.innerWidth() - xdragging.outerWidth()) / 2) ;
				xdragging.css('top', dropping.offset().top + (dropping.innerHeight() - xdragging.outerHeight()) / 2) ;
			}
			obj.trigger('drop', dataTransfer, obj.get('element'), dropping) ;
		}
	}
	
	// 根据revert判断是否要返回并执行(若指定放置元素且没drop则自动回到原处与revert设置无关)
	function executeRevert(){
		var xdragging = obj.get('proxy') ;
		var xleft = 0, xtop = 0 ;
		// 是否返回
		if(obj.get('revert') || (dropping === null && obj.get('drop') !== null)){ 
			// 代理元素返回源节点处
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
			xdragging.animate({left: obj.get('element').offset().left, top: obj.get('element').offset().top}, 
				obj.get('revertDuration'), function(){
				// 删除代理元素 显示源节点
				obj.get('element').css('visibility', 'visible') ;
				xdragging.remove() ;
			}) ;
		}
		else{
			// 源节点移动到代理元素处
			xleft = xdragging.offset().left - obj.get('element').offset().left ;
			xtop = xdragging.offset().top - obj.get('element').offset().top ;
			if(obj.get('element').css('position') === 'relative'){
				obj.get('element').css('left', (isNaN(parseInt(obj.get('element').css('left'))) ? 0 : parseInt(obj.get('element').css('left'))) + xleft) ;
				obj.get('element').css('top', (isNaN(parseInt(obj.get('element').css('top'))) ? 0 : parseInt(obj.get('element').css('top'))) + xtop) ;
			}
			else{
				obj.get('element').css('position', 'relative') ;
				obj.get('element').css('left', xleft) ;
				obj.get('element').css('top', xtop) ;
			}
			// 删除代理元素 显示源节点
			obj.get('element').css('visibility', 'visible') ;
			xdragging.remove() ;
		}
	}
	
	
	/*---------------------------------------------some useful static private function----------------------------------*/
	// 判断点元素B是否位于元素A内部 or 点(B, C)是否位于A内 or (B, C) width=D, height=F是否位于A内
	function isContain(A, B, C, D, F){
		var x = 0, y = 0, width = 0, height = 0;
		if(arguments.length == 2){
			return $(A).offset().left <= $(B).offset().left && $(A).offset().left + $(A).innerWidth() >= $(B).offset().left + $(B).outerWidth() &&
					$(A).offset().top <= $(B).offset().top && $(A).offset().top + $(A).innerHeight() >= $(B).offset().top + $(B).outerHeight() ;
		}
		// B, C为点坐标
		if(arguments.length == 3){  
			x = B, y = C ;
			return $(A).offset().left <= x && $(A).offset().left + $(A).innerWidth() >= x &&
					$(A).offset().top <= y && $(A).offset().top + $(A).innerHeight() >= y ;
		}
		if(arguments.length == 5){
			x = B, y = C, width = D, height = F ;
			return $(A).offset().left <= x && $(A).offset().left + $(A).innerWidth() >= x + width &&
					$(A).offset().top <= y && $(A).offset().top + $(A).innerHeight() >= y + height ;
		}
	}
	
	// 检查参数合法性
	function handleArgument(elem, config){
		if($(elem).size() === 0){
			throw new Error('element error!') ;
		}
		for(option in config){
			switch(option){
				case 'containment':
					if($(config.containment).size() === 0 || !isContain($(config.containment), $(elem))){
						config.containment = null ;
					}
					break ;
				case 'axis':
					if(config.axis !== 'x' && config.axis !== 'y' && config.axis !== false){
						config.axis = false ;
					}
					break ;
				case 'visible':
					if(typeof(config.visible) !== 'boolean'){
						config.visible = false ;
					}
					break ;
				case 'proxy':
					if($(config.proxy).size() === 0){
						config.proxy = null ;
					}
					break ;
				case 'drop':
					if($(config.drop).size() === 0){
						config.drop = null ;
					}
					break ;
				case 'revert':
					if(typeof(config.revert) !== 'boolean'){
						config.revert = false ;
					}
					break ;
				case 'revertDuration':
					if(typeof(config.revertDuration) !== 'number'){
						config.revertDuration = 500 ;
					}
					break ;
				case 'disabled':
					if(typeof(config.disabled) !== 'boolean'){
						config.disabled = false ;
					}
					break ;
				case 'dragCursor':
					if(typeof(config.dragCursor) !== 'string'){
						config.dragCursor = 'move' ;
					}
					break ;
				case 'dropCursor':
					if(typeof(config.dropCursor) !== 'string'){
						config.dropCursor = 'copy' ;
					}
					break ;
				case 'dataTransfer':
					if(typeof(config.dataTransfer) !== 'object'){
						config.dataTransfer = null ;
					}
					break ;
			}
		}
	}
	
	Dnd.prototype.open() ;
	module.exports = Dnd ;	
}) ;

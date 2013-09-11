define(function(require){

  var $ = require('$'),
      Dnd = require('dnd'),
      expect = require('expect') ;


  describe('Dnd', function(){
      var template = '<style>' + 
                     '.container{width:500px; height:200px;background:#CCC;}' +
                     '.drag {width:50px; height:50px; background:#07B1EE; ' +
		     'position:relative;}' + 
		     '.smalldrag {width:20px; height:20px; background:#fff; ' +
		     'margin:auto; position:absolute; left:0; top:0; right:0;' +
		     'bottom:0;}' +
                     '</style>' +
                     '<div id="wrap"><div id="container1" class="container">' +
                     '<div id="drag1" class="drag">' +
		     '<div class="smalldrag"></div>' +
		     '</div></div><br/>' +
                     '<div id="drop1" class="container"></div></div>', 
          element = null,
          dnd = null ;
      
      beforeEach(function(){
          element = $(template).appendTo(document.body);
      });
      
      afterEach(function(){
          element.remove() ;
          dnd = null ;
          element = null ;
      });
      
      
      
      /*
       * 测试用例比较位置数值时，均加了parseInt
       * 主要由于IE高版本浏览器(10 & 11)对offset返回值的差异
      */
      
      
      // 测试构造
      it('instance', function(){
          // 非法构造
          try{
              dnd = new Dnd() ;
          } catch(error){
              expect(error.message).to.be('element error!') ;
          }
          
          // 一般构造
          dnd = new Dnd('#drag1') ;
          expect(dnd.get('element').get(0)).to.be($('#drag1').get(0)) ;
          expect(dnd.get('containment').get(0)).to.be(document) ;
          expect(dnd.get('axis')).to.be(false) ;
          expect(dnd.get('visible')).to.be(false) ;
          expect(dnd.get('proxy').attr('id')).to.be('drag1') ;
          expect(dnd.get('drop')).to.be(null) ;
          expect(dnd.get('revert')).to.be(false) ;
          expect(dnd.get('revertDuration')).to.be(500) ;
          expect(dnd.get('disabled')).to.be(false) ;
          expect(dnd.get('dragCursor')).to.be('move') ;
          expect(dnd.get('dropCursor')).to.be('copy') ;
          expect(dnd.get('zIndex')).to.be(9999) ;
      });
      
      

      // 测试两阶段拖放
      it('drag', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              lastx = 0,
              lastx = 0 ;
          dnd = new Dnd('#drag1') ;
          $('#drag1').on('mousedown', function(event, x, y){
              event.which = 1 ;
	      event.target = $('.smalldrag').get(0) ;
              lastx = event.pageX = originx + x;
              lasty = event.pageY = originy + y ;
          }) ;
          $('#drag1').on('mousemove', function(event, x, y){
	      event.target = $('.smalldrag').get(0) ;
              lastx = event.pageX = lastx + x ;
              lasty = event.pageY = lasty + y ;
          }) ;
          
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [100, 150]) ;
          $(document).trigger('mouseup') ;
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [100, 150]) ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect(parseInt($('#drag1').offset().left)).to.be(originx + 200) ;
              expect(parseInt($('#drag1').offset().top)).to.be(originy + 300) ;
              done() ;
          }, 80) ;
      }) ;
      
      
      
      // 测试关闭页面拖放
      it('close', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              lastx = 0,
              lasty = 0 ;
          
          dnd = new Dnd('#drag1') ;
          $('#drag1').on('mousedown', function(event, x, y){
              event.which = 1 ;
              lastx = event.pageX = originx + x ;
              lasty = event.pageY = originy + y ;
          }) ;
          $('#drag1').on('mousemove', function(event, x, y){
              lastx = event.pageX = lastx + x ;
              lasty = event.pageY = lasty + y ;
          }) ;
          
          Dnd.close() ;
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [200, 300]) ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect($('#drag1').offset().left).
                      to.be(parseInt(originx)) ;
              expect($('#drag1').offset().top).
                      to.be(parseInt(originy)) ;
              Dnd.open() ;
              done() ;
          }, 80) ;
      }) ;
      
      
      
      // 测试边界和方向约束
      it('containment & axis', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              lastx = 0,
              lasty = 0 ;
          
          dnd = new Dnd('#drag1', {containment: '#container1', axis: 'x'}) ;
          $('#drag1').on('mousedown', function(event, x, y){
              event.which = 1 ;
              lastx = event.pageX = originx + x ;
              lasty = event.pageY = originy + y ;
          }) ;
          $('#drag1').on('mousemove', function(event, x, y){
              lastx = event.pageX = lastx + x ;
              lasty = event.pageY = lasty + y ;
          }) ;
              
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [1000, 1000]) ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect($('#drag1').offset().left + $('#drag1').outerWidth()).to.
                      be($('#container1').offset().left +      
                      $('#container1').outerWidth()) ;
              expect($('#drag1').offset().top).to.
                      be($('#container1').offset().top) ;
              done() ;
          }, 80) ;
      }) ; 
      
      
      
      // 测试drop, 并且没完全置于drop元素中时，将自动将源节点置于drop中央
      it('drop in the center', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              lastx = 0,
              lasty = 0 ;
          
          dnd = new Dnd('#drag1', {drop: '#drop1'}) ;
          $('#drag1').on('mousedown', function(event, x, y){
              event.which = 1 ;
              lastx = event.pageX = originx + x ;
              lasty = event.pageY = originy + y ;
          }) ;
          $('#drag1').on('mousemove', function(event, x, y){
              lastx = event.pageX = lastx + x ;
              lasty = event.pageY = lasty + y ;
          }) ;
          
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [200, 220]) ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect(parseInt($('#drag1').offset().left)).to.
                      be(parseInt($('#drop1').offset().left + 
                      ($('#drop1').outerWidth() - 
                      $('#drag1').outerWidth()) / 2)) ;
              expect(parseInt($('#drag1').offset().top)).to.
                      be(parseInt($('#drop1').offset().top + 
                      ($('#drop1').outerHeight() - 
                      $('#drag1').outerHeight()) / 2)) ;
              done() ;
          }, 80) ;
      }) ;
      
      
      
      // 测试整个系列事件触发情况以及dataTransfer传输状况
      it('events & dataTransfer', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              lastx = 0,
              lasty = 0 ;
          
          dnd = new Dnd('#drag1', {drop: '#drop1'}) ;
          $('#drag1').on('mousedown', function(event, x, y){
              event.which = 1 ;
              lastx = event.pageX = originx + x ;
              lasty = event.pageY = originy + y ;
          }) ;
          $('#drag1').on('mousemove', function(event, x, y){
              lastx = event.pageX = lastx + x ;
              lasty = event.pageY = lasty + y ;
          }) ;
          dnd.on('dragstart', function(dataTransfer, dragging, dropping){
              dataTransfer.data = '我是叁儿' ;
          }) ;
          dnd.on('drop', function(dataTransfer, dragging, dropping){
              dropping.data('message', dataTransfer.data);
          }) ;
          dnd.on('dragenter', function(dragging, dropping){
              dropping.data('isDragenter', true) ;
          }) ;
          dnd.on('dragleave', function(dragging, dropping){
              dropping.data('isDragleave', true) ;
          }) ;
          dnd.on('dragover', function(dragging, dropping){
              dropping.data('isDragover', true) ;
          }) ;
          dnd.on('dragenter', function(dragging, dropping){
              dropping.data('isDragend', true) ;
          }) ;
          
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [200, 300]) ;
          $('#drag1').trigger('mousemove', [10, 10]) ;
          $('#drag1').trigger('mousemove', [1000, 1000]) ;
          $('#drag1').trigger('mousemove', [-1000, -1000]) ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect($('#drop1').data('message')).to.be('我是叁儿') ;
              expect($('#drop1').data('isDragenter')).to.be(true) ;
              expect($('#drop1').data('isDragover')).to.be(true) ;
              expect($('#drop1').data('isDragleave')).to.be(true) ;
              expect($('#drop1').data('isDragend')).to.be(true) ;
              done() ;
          }, 80) ;
      }) ;
      
     
     
      // 测试esc将返回源节点初始位置
      it('esc revert', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              lastx = 0,
              lasty = 0 ;
          
          dnd = new Dnd('#drag1', {drop:'#drop1', revert: true}) ;
          $('#drag1').on('mousedown', function(event, x, y){
              event.which = 1 ;
              lastx = event.pageX = originx + x ;
              lasty = event.pageY = originy + y ;
          }) ;
          $('#drag1').on('mousemove', function(event, x, y){
              lastx = event.pageX = lastx + x ;
              lasty = event.pageY = lasty + y ;
          }) ;
          $('#drag1').on('keydown', function(event, x, y){
              event.which = 27 ;
          }) ;
          
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [200, 300]) ;
          $('#drag1').trigger('keydown') ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect(parseInt($('#drag1').offset().left)).
                      to.be(parseInt(originx)) ;
              expect(parseInt($('#drag1').offset().top)).
                      to.be(parseInt(originy)) ;
              done() ;
          }, 1000) ;
      }) ;
      
  }); 

});

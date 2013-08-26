define(function(require){

  var $ = require('$'),
      Dnd = require('dnd'),
      expect = require('expect') ;


  describe('Dnd', function(){
      var template = '<style>' + 
                     '.container{width:500px; height:200px;background:#CCC;}' +
                     '.drag{width:50px; height:50px;background:#07B1EE;}' +
                     '</style>' +
                     '<div id="wrap"><div id="container1" class="container">' +
                     '<div id="drag1" class="drag"></div></div><br/>' +
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
      
      
      // 测试构造
      it('instance', function(done){
          // 非法构造
          try{
              dnd = new Dnd() ;
          } catch(error){
              expect(error.message).to.be('element error!') ;
          }
          
          // 一般构造
          dnd = new Dnd('#drag1') ;
          expect(dnd.get('element').get(0)).to.be($('#drag1').get(0)) ;
          expect(dnd.get('containment')).to.be(null) ;
          expect(dnd.get('axis')).to.be(false) ;
          expect(dnd.get('visible')).to.be(false) ;
          expect(dnd.get('proxy')).to.be(null) ;
          expect(dnd.get('drop')).to.be(null) ;
          expect(dnd.get('revert')).to.be(false) ;
          expect(dnd.get('revertDuration')).to.be(500) ;
          expect(dnd.get('disabled')).to.be(false) ;
          expect(dnd.get('dragCursor')).to.be('move') ;
          expect(dnd.get('dropCursor')).to.be('copy') ;
          expect(dnd.get('zIndex')).to.be(9999) ;
          
          // 不合法配置mousedown后, 自动转化为默认配置
          dnd = new Dnd('#drag1', {containment: '#drop1', proxy: '#drag1',
                drop: '#drag1', axis: 0, visible: 0, revert: 0,      
                revertDuration:'aaa', disabled:0, dragCursor:0, dropCursor:0, 
                zIndex: 'aaa'}) ;
          expect(dnd.get('containment')).to.be('#drop1') ;
          expect(dnd.get('proxy')).to.be('#drag1') ;
          expect(dnd.get('drop')).to.be('#drag1') ;
          expect(dnd.get('axis')).to.be(0) ;
          expect(dnd.get('visible')).to.be(0) ;
          expect(dnd.get('revert')).to.be(0) ;
          expect(dnd.get('revertDuration')).to.be('aaa') ;
          expect(dnd.get('disabled')).to.be(0) ;
          expect(dnd.get('dragCursor')).to.be(0) ;
          expect(dnd.get('dropCursor')).to.be(0) ;
          expect(dnd.get('zIndex')).to.be('aaa') ;
          $('#drag1').on('mousedown', function(event, x, y){
              event.which = 1 ;
          }) ;
          $('#drag1').trigger('mousedown') ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect(dnd.get('containment')).to.be(null) ;
              expect(dnd.get('proxy').get(0) !==   
                      $('#drag1').get(0)).to.be(true) ;
              expect(dnd.get('drop')).to.be(null) ;
              expect(dnd.get('axis')).to.be(false) ;
              expect(dnd.get('visible')).to.be(false) ;
              expect(dnd.get('revert')).to.be(false) ;
              expect(dnd.get('revertDuration')).to.be(500) ;
              expect(dnd.get('disabled')).to.be(false) ;
              expect(dnd.get('dragCursor')).to.be('move') ;
              expect(dnd.get('dropCursor')).to.be('copy') ;
              expect(dnd.get('zIndex')).to.be(9999) ;
              done() ;
          }, 80) ;
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
              lastx = event.pageX = originx + x;
              lasty = event.pageY = originy + y ;
          }) ;
          $('#drag1').on('mousemove', function(event, x, y){
              lastx = event.pageX = lastx + x ;
              lasty = event.pageY = lasty + y ;
          }) ;
          
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [200, 300]) ;
          $(document).trigger('mouseup') ;
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [200, 300]) ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect($('#drag1').offset().left).to.be(originx + 400) ;
              expect($('#drag1').offset().top).to.be(originy + 600) ;
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
          
          dnd.close() ;
          $('#drag1').trigger('mousedown', [20, 20]) ;
          $('#drag1').trigger('mousemove', [200, 300]) ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect($('#drag1').offset().left).to.be(originx) ;
              expect($('#drag1').offset().top).to.be(originy) ;
              dnd.open() ;
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
              expect($('#drag1').offset().left).to.
                      be($('#drop1').offset().left + 
                      ($('#drop1').outerWidth() - 
                      $('#drag1').outerWidth()) / 2) ;
              expect($('#drag1').offset().top).to.
                      be($('#drop1').offset().top + 
                      ($('#drop1').outerHeight() - 
                      $('#drag1').outerHeight()) / 2) ;
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
              expect($('#drag1').offset().left).to.be(originx) ;
              expect($('#drag1').offset().top).to.be(originy) ;
              done() ;
          }, 1000) ;
      }) ; 
      
  });

});
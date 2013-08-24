define(function(require){

  var $ = require('$'),
      Dnd = require('dnd'),
      expect = require('expect') ;


  describe('Dnd', function(){
      var template = '<style>' + 
                     '.container{width:500px; height:200px;background:#CCC;}' +
                     '.drag{width:50px; height:50px;background:#07B1EE;}' +
                     '</style>' +
                     '<div id="container1" class="container">' +
                     '<div id="drag1" class="drag"></div></div><br/>' +
                     '<div id="drop1" class="container"></div>', 
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
          dnd = new Dnd('#drag1', {containment: '#drop1'}) ;
          expect(dnd.get('containment')).to.be('#drop1') ;
          $('#drag1').on('mousedown', function(event){
              event.which = 1 ;
          }) ;
          $('#drag1').trigger('mousedown') ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect(dnd.get('containment')).to.be(null) ;
              done() ;
          }, 80) ;
      });
      
      it('drag', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              x = 0,
              y = 0 ;
          
          dnd = new Dnd('#drag1') ;
          $('#drag1').on('mousedown', function(event){
              event.which = 1 ;
              x = event.pageX = originx + 20 ;
              y = event.pageY = originy + 20 ;
          }) ;
          $('#drag1').on('mousemove', function(event){
              event.pageX = x + 10 ;
              event.pageY = y + 10 ;
          }) ;
          
          $('#drag1').trigger('mousedown') ;
          $('#drag1').trigger('mousemove') ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect($('#drag1').offset().left).to.be(originx + 10) ;
              expect($('#drag1').offset().top).to.be(originy + 10) ;
              done() ;
          }, 80) ;
      }) ;
      
      it('dataTransfer', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              x = 0,
              y = 0 ;
          
          dnd = new Dnd('#drag1', {drop: '#drop1'}) ;
          $('#drag1').on('mousedown', function(event){
              event.which = 1 ;
              x = event.pageX = originx + 20 ;
              y = event.pageY = originy + 20 ;
          }) ;
          $('#drag1').on('mousemove', function(event){
              event.pageX = x + 200 ;
              event.pageY = y + 300 ;
          }) ;
          dnd.on('dragstart', function(dataTransfer, dragging, dropping){
              dataTransfer.data = '我是叁儿' ;
          }) ;
          dnd.on('drop', function(dataTransfer, dragging, dropping){
              dropping.data('message', dataTransfer.data);
          }) ;
          
          $('#drag1').trigger('mousedown') ;
          $('#drag1').trigger('mousemove') ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect($('#drop1').data('message')).to.be('我是叁儿') ;
              done() ;
          }, 80) ;
      }) ;
      
      it('containment & axis', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              x = 0,
              y = 0 ;
          
          dnd = new Dnd('#drag1', {containment: '#container1', axis: 'x'}) ;
          $('#drag1').on('mousedown', function(event){
              event.which = 1 ;
              x = event.pageX = originx + 20 ;
              y = event.pageY = originy + 20 ;
          }) ;
          $('#drag1').on('mousemove', function(event){
              event.pageX = x + 1000 ;
              event.pageY = y + 1000 ;
          }) ;
          
          $('#drag1').trigger('mousedown') ;
          $('#drag1').trigger('mousemove') ;
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
      
      it('revert', function(done){
          var originx = $('#drag1').offset().left ;
              originy = $('#drag1').offset().top ;
              x = 0,
              y = 0 ;
          
          dnd = new Dnd('#drag1', {revert: true}) ;
          $('#drag1').on('mousedown', function(event){
              event.which = 1 ;
              x = event.pageX = originx + 20 ;
              y = event.pageY = originy + 20 ;
          }) ;
          $('#drag1').on('mousemove', function(event){
              event.pageX = x + 100 ;
              event.pageY = y + 100 ;
          }) ;
          
          $('#drag1').trigger('mousedown') ;
          $('#drag1').trigger('mousemove') ;
          $(document).trigger('mouseup') ;
          setTimeout(function(){
              expect($('#drag1').offset().left).to.be(originx) ;
              expect($('#drag1').offset().top).to.be(originy) ;
              done() ;
          }, 80) ;
      }) ;
      
  });

});



















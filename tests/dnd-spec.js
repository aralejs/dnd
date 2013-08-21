define(function(require){

  var $ = require('$'),
      Dnd = require('dnd'),
      expect = require('expect') ;


  describe('Dnd', function(){
      var template = '<style>.container{width:500px; height:200px;}' +
                     '.drag{width:50px; height:50px;}' +
                     '.over {border:2px dashed #000;}</style>' + 
                     '<div id="container1" class="container">' +
                     '<div id="drag1" class="drag"></div></div>' +
                     '<div id="drop1" class= "drop"></div>' +
                     '<div id="drop2" class= "drop"></div>' ;
      var element = null,
          dnd = null ;
      
      beforeEach(function(){
          element = $(template).appendTo(document.body);
      });
      
      afterEach(function(){
          dnd = null ;
          element && element.remove() ;
      });
      
      it('instance', function(){
          /*
           * 无元素参数Dnd抛出异常
          */
          try{
              dnd = new Dnd() ;
          } catch(error){
              expect(error.message).to.be('element error!') ;
          }
          
          /*
           * 一般构造
          */
          dnd = new Dnd('#drag1', {containment: '#container1'}) ;
          expect(dnd.get('element').get(0)).to.be($('#drag1').get(0)) ;
          expect(dnd.get('containment')).to.be('#container1') ;
          expect(dnd.get('axis')).to.be(false) ;
          expect(dnd.get('visible')).to.be(false) ;
          expect(dnd.get('proxy')).to.be(null) ;
          expect(dnd.get('drop')).to.be(null) ;
          expect(dnd.get('revert')).to.be(false) ;
          expect(dnd.get('revertDuration')).to.be(500) ;
          expect(dnd.get('disabled')).to.be(false) ;
          expect(dnd.get('dragCursor')).to.be('move') ;
          expect(dnd.get('dropCursor')).to.be('copy') ;
          expect($('#drag1').data('dnd')).to.be(dnd) ;
      });
      
      it('set & mousedown', function(done){
          /*
           * set设置一个不合法的值，mousedown后会恢复默认值
          */
          dnd = new Dnd('#drag1') ;
          dnd.set('containment', '#drag1') ;
          dnd.set('axis', 'xy') ;
          
          $('#drag1').on('mousedown', function(event){
              event.which = 1 ;
          }) ;
          $('#drag1').trigger('mousedown') ;
          setTimeout(function(){
              expect(dnd.get('containment')).to.be(null) ;
              expect(dnd.get('axis')).to.be(false) ;
              done() ;
          }, 80) ;
          $('#drag1').trigger('mouseup') ;
      }) ;
      
      it('dataTransfer', function(done){
          dnd = new Dnd('#drag1', {drop: '.drop'}) ;
          $('#drag1').on('mousedown', function(event){
              event.which = 1 ;
          }) ;
          dnd.on('dragstart', function(dataTransfer, dragging, dropping){
              dataTransfer.data = dragging.attr('id') ;
          }) ;
          dnd.on('drop', function(dataTransfer, dragging, dropping){
              dropping.data('info', dataTransfer.data) ;
          }) ;
      }) ;
      
      
      
  });

});



















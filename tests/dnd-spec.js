define(function(require){

  var $ = require('$'),
      Dnd = require('dnd'),
      expect = require('expect') ;


  describe('Dnd', function(){
      var template = null,
      var element = null,
      var dnd = null ;
      
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
      });
      
      

      // 测试两阶段拖放
      it('drag', function(done){
      }) ;
      
      
      
      // 测试关闭页面拖放
      it('close', function(done){
      }) ;
      
      
      
      // 测试边界和方向约束
      it('containment & axis', function(done){
      }) ; 
      
      
      
      // 测试drop, 并且没完全置于drop元素中时，将自动将源节点置于drop中央
      it('drop in the center', function(done){
      }) ;
      
      
      
      // 测试整个系列事件触发情况以及dataTransfer传输状况
      it('events & dataTransfer', function(done){
      }) ;
      
  }); 

});

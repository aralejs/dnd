
// 依赖组件
var $ = require('jquery');
var Dnd = require('../index.js');
var expect = require('expect.js');

describe('dnd', function () {
    var template = '<div class="dnd-test"></div>' + 
            '<div class="drop"></div>';
    $(template).appendTo($('body'));
    var dnd = null;
    $('.dnd-test').css({
        width: 80,
        height: 80
    });
    $('.drop').css({
        width: 80,
        height: 80
    });
    $('.dnd-test').on('mousedown', '.drag', function (event, x, y) {
        event.which = 1;
        event.pageX = x;
        event.pageY = y;
    });
    $('.dnd-test').on('mousemove', function (event, x, y) {
        event.pageX = x;
        event.pageY = y;
    });

    beforeEach(function () {
        $('.dnd-test').html('<div class="drag" style="width:50px;' +
                'height:50px"></div>');
    });
    afterEach(function () {
        dnd = null;
        $('.dnd-test').html('');
    });

    describe('instance init', function () {

        it('instance by constructor', function () {
            dnd = new Dnd('.dnd-test .drag');
            expect($('.dnd-test .drag').data('dnd')).to.be.a('number');
        });

        it('instance by data-attr', function (done) {
            $('.dnd-test .drag').data('dnd', true);
            $('.dnd-test .drag').trigger('mousedown');
            $('.dnd-test .drag').trigger('mouseup');
            setTimeout(function () {
                expect($('.dnd-test .drag').data('dnd')).to.be.a('number');
                done();
            }, 0);
        });

        it('instance many elements at the same time', function () {
            $('.dnd-test .drag').after(
                    '<div class="drag" style="width:50px; height:50px">')
            dnd = new Dnd('.dnd-test .drag');
            expect($('.dnd-test .drag').eq(0).data('dnd')).
                    to.be($('.dnd-test .drag').eq(1).data('dnd'));
        });
    });


    describe('drag without drops', function () {

        it('simple drag & element is visible', function (done) {
            dnd = new Dnd('.dnd-test .drag', {visible: true});
            var diffX = 10;
            var diffY = 10;
            var originOffset = $('.dnd-test .drag').offset();

            $('.dnd-test .drag').trigger('mousedown',
                    [originOffset.left + diffX, originOffset.top + diffY]);
            $('.dnd-test').trigger('mousemove', [1, 1]);
            $('.dnd-test').trigger('mousemove', [100, 100]);
            $('.dnd-test').trigger('mouseup');

            setTimeout(function () {
                expect($('.dnd-test .drag').offset()).to.eql({
                    top: 100 - diffY,
                    left: 100 - diffX
                });
                done();
            }, 1000);
        });

        it('drag twice', function (done) {
            dnd = new Dnd('.dnd-test .drag');
            var diffX = 10;
            var diffY = 10;
            var originOffset = $('.dnd-test .drag').offset();

            $('.dnd-test .drag').trigger('mousedown',
                    [originOffset.left + diffX, originOffset.top + diffY]);
            $('.dnd-test').trigger('mousemove', [1, 1]);
            $('.dnd-test').trigger('mousemove', [100, 100]);
            $('.dnd-test').trigger('mouseup');
            originOffset = $('.dnd-test .drag').offset();
            $('.dnd-test .drag').trigger('mousedown',
                    [originOffset.left + diffX, originOffset.top + diffY]);
            $('.dnd-test').trigger('mousemove', [1, 1]);
            $('.dnd-test').trigger('mousemove', [200, 200]);
            $('.dnd-test').trigger('mouseup');

            setTimeout(function () {
                expect($('.dnd-test .drag').offset()).to.eql({
                    top: 200 - diffY,
                    left: 200 - diffX
                });
                done();
            }, 0);
        });

        it('drag inside containment', function (done) {
            dnd = new Dnd('.dnd-test .drag', {containment: '.dnd-test'});
            var diffX = 10;
            var diffY = 10;
            var originOffset = $('.dnd-test .drag').offset();
            var offset = $('.dnd-test').offset();
            var size = {
                width: $('.dnd-test').width(),
                height: $('.dnd-test').height()
            };

            $('.dnd-test .drag').trigger('mousedown',
                    [originOffset.left + diffX, originOffset.top + diffY]);
            $('.dnd-test').trigger('mousemove', [1, 1]);
            $('.dnd-test').trigger('mousemove',
                    [offset.left + size.width + 100,
                    offset.top + size.height + 100]);
            $('.dnd-test').trigger('mouseup');

            setTimeout(function () {
                var size2 = {
                    width: $('.dnd-test .drag').width(),
                    height: $('.dnd-test .drag').height()
                }
                expect($('.dnd-test .drag').offset()).to.eql({
                    top: offset.top + size.height - size2.height,
                    left: offset.left + size.width - size2.width
                });
                done();
            }, 0);
        });

        it('drag in one orientation', function (done) {
            dnd = new Dnd('.dnd-test .drag', {axis: 'x'});
            var diffX = 10;
            var diffY = 10;
            var originOffset = $('.dnd-test .drag').offset();

            $('.dnd-test .drag').trigger('mousedown',
                    [originOffset.left + diffX, originOffset.top + diffY]);
            $('.dnd-test').trigger('mousemove', [1, 1]);
            $('.dnd-test').trigger('mousemove', [100, 100]);
            $('.dnd-test').trigger('mouseup');

            setTimeout(function () {
                expect($('.dnd-test .drag').offset()).to.eql({
                    top: originOffset.top,
                    left: 100 - diffX
                });
                done();
            }, 0);
        });
    });


    describe('with drops', function () {

        it('outside the drops, then revert', function (done) {
            dnd = new Dnd('.dnd-test .drag', {drops: '.drop'});
            var diffX = 10;
            var diffY = 10;
            var originOffset = $('.dnd-test .drag').offset();
            var offset = $('.drop').offset();
            var size = {
                width: $('.drop').width(),
                height: $('.drop').height()
            };

            $('.dnd-test .drag').trigger('mousedown',
                    [originOffset.left + diffX, originOffset.top + diffY]);
            $('.dnd-test').trigger('mousemove', [1, 1]);
            $('.dnd-test').trigger('mousemove', 
                    [offset.left + size.width + 100,
                    offset.top + size.height + 100]);
            $('.dnd-test').trigger('mouseup');

            setTimeout(function () {
                expect($('.dnd-test .drag').offset()).to.eql({
                    top: originOffset.top,
                    left: originOffset.left
                });
                done();
            }, 800);
        });

        it('drop in the center', function (done) {
            dnd = new Dnd('.dnd-test .drag', {drops: '.drop'});
            var diffX = 10;
            var diffY = 10;
            var originOffset = $('.dnd-test .drag').offset();
            var offset = $('.drop').offset();
            var size = {
                width: $('.drop').width(),
                height: $('.drop').height()
            };

            $('.dnd-test .drag').trigger('mousedown',
                    [originOffset.left + diffX, originOffset.top + diffY]);
            $('.dnd-test').trigger('mousemove', [1, 1]);
            $('.dnd-test').trigger('mousemove', 
                    [offset.left, offset.top]);
            $('.dnd-test').trigger('mouseup');

            setTimeout(function () {
                var size2 = {
                    width: $('.dnd-test .drag').width(),
                    height: $('.dnd-test .drag').height()
                }
                expect($('.dnd-test .drag').offset()).to.eql({
                    top: offset.top + (size.height - size2.height)/2,
                    left: offset.left + (size.width - size2.width)/2
                });
                done();
            }, 0);
        });
    });


    describe('dnd with dataTransfer', function () {

        it('events & dataTransfer', function (done) {
            dnd = new Dnd('.dnd-test .drag', {drops: '.drop'});
            var diffX = 10;
            var diffY = 10;
            var originOffset = $('.dnd-test .drag').offset();
            var offset = $('.drop').offset();
            var size = {
                width: $('.drop').width(),
                height: $('.drop').height()
            };

            dnd.on('dragstart', function(dataTransfer, proxy){
                dataTransfer.data = 'I am ustccjw';
            });
            dnd.on('drop', function(dataTransfer, proxy, drop){
                drop.data('message', dataTransfer.data);
            });
            dnd.on('dragenter', function(proxy, drop){
                drop.data('isDragenter', true);
            });
            dnd.on('dragleave', function(proxy, drop){
                drop.data('isDragleave', true);
            });
            dnd.on('dragover', function(proxy, drop){
                drop.data('isDragover', true);
            });
            dnd.on('dragenter', function(proxy, drop){
                drop.data('isDragend', true);
            });
            dnd.on('dragend', function(element, drop){
                drop.data('isDragend', true);
            });

            $('.dnd-test .drag').trigger('mousedown',
                    [originOffset.left + diffX, originOffset.top + diffY]);
            $('.dnd-test').trigger('mousemove', [1, 1]);
            $('.dnd-test').trigger('mousemove', 
                    [offset.left, offset.top]);
            $('.dnd-test').trigger('mousemove', 
                    [offset.left + 10, offset.top + 10]);
            $('.dnd-test').trigger('mousemove', 
                    [offset.left + size.width + 100, 
                    offset.top + size.height + 100]);
            $('.dnd-test').trigger('mousemove', 
                    [offset.left, offset.top]);
            $('.dnd-test').trigger('mouseup');

            setTimeout(function () {
                expect($('.drop').data('message')).to.be('I am ustccjw') ;
                expect($('.drop').data('isDragenter')).to.be(true) ;
                expect($('.drop').data('isDragover')).to.be(true) ;
                expect($('.drop').data('isDragleave')).to.be(true) ;
                expect($('.drop').data('isDragend')).to.be(true) ;
                done();
            }, 0);
        });
    })
});

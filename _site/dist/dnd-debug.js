define("arale/dnd/1.0.0/dnd-debug", [ "$-debug" ], function(require, exports, module) {
    var Dnd;
    var $ = require("$-debug");
    // static private variable
    var draggingPre = false, // 标识预拖拽，鼠标点击可拖拽元素
    dragging = null, // 标识当前的拖拽元素
    dropping = null, // 标识当前的目标元素
    diffX = 0, diffY = 0, // diffX, diffY记录鼠标离拖拽元素的距离
    options = {
        // default options
        containment: null,
        axis: false,
        visible: false,
        proxy: "origin",
        drop: null,
        revert: false,
        revertDuration: 500,
        disabled: false,
        dragCursor: "move",
        dropCursor: "copy",
        dataTransfer: null
    }, obj = {};
    // 存储当前拖放的Dnd instance
    // constructor function
    function Dnd(elem, arg) {
        if (!check(elem, arg)) {
            throw new Error("arguments error");
        }
        this.elem = $(elem);
        this.options = {};
        $.extend(this.options, options, arg);
        // 设置代理元素proxy
        if (this.options.proxy === "origin") {
            this.proxy = this.elem.clone();
        } else {
            this.proxy = $(this.options.proxy);
        }
        this.proxy.css("position", "absolute");
        this.proxy.css("margin", "0");
        this.proxy.css("cursor", this.options.dragCursor);
        // store the instance
        this.elem.data("draggable", this);
    }
    // static public function to enable Dnd
    Dnd.prototype.open = function() {
        $(document).on("mousedown", handleDragEvent);
        $(document).on("mousemove", handleDragEvent);
        $(document).on("mouseup", handleDragEvent);
    };
    // static public function to disable Dnd
    Dnd.prototype.close = function() {
        $(document).off("mousedown", handleDragEvent);
        $(document).off("mousemove", handleDragEvent);
        $(document).off("mouseup", handleDragEvent);
    };
    // static private function to handle events
    function handleDragEvent(event) {
        var target = $(event.target);
        switch (event.type) {
          case "mousedown":
            // 鼠标左键按下并且是可移动元素
            if (event.which === 1 && typeof target.data("draggable") === "object") {
                draggingPre = true;
                obj = target.data("draggable");
                // 使源节点的信息对象赋给对象obj
                obj.proxy.css("left", obj.elem.offset().left);
                obj.proxy.css("top", obj.elem.offset().top);
                obj.proxy.css("visibility", "hidden");
                obj.proxy.appendTo("body");
                diffX = event.pageX - obj.elem.offset().left;
                diffY = event.pageY - obj.elem.offset().top;
                event.preventDefault();
            }
            break;

          case "mousemove":
            if (draggingPre) {
                // 拖放开始
                draggingPre = false;
                dragging = obj.proxy;
                if (!obj.options.visible) {
                    obj.elem.css("visibility", "hidden");
                }
                obj.proxy.css("visibility", "visible");
                obj.elem.trigger("dragstart", obj.options.dataTransfer);
                return;
            }
            if (dragging) {
                // 边界和方向一起约束是否被拖动
                var container = null;
                if (obj.options.containment !== null) {
                    var container = $(obj.options.containment);
                }
                if (obj.options.axis !== "y") {
                    if (container === null || isContain(container, event.pageX - diffX, dragging.offset().top, dragging.outerWidth(), dragging.outerHeight())) {
                        dragging.css("left", event.pageX - diffX);
                    } else {
                        if (event.pageX - diffX <= container.offset().left) {
                            dragging.css("left", container.offset().left);
                        } else {
                            dragging.css("left", container.offset().left + container.innerWidth() - dragging.outerWidth());
                        }
                    }
                }
                if (obj.options.axis !== "x") {
                    if (container === null || isContain(container, dragging.offset().left, event.pageY - diffY, dragging.outerWidth(), dragging.outerHeight())) {
                        dragging.css("top", event.pageY - diffY);
                    } else {
                        if (event.pageY - diffY <= container.offset().top) {
                            dragging.css("top", container.offset().top);
                        } else {
                            dragging.css("top", container.offset().top + container.innerHeight() - dragging.outerHeight());
                        }
                    }
                }
                obj.elem.trigger("drag");
                // 进出放置元素  用dragging来判断 不能用event.pageX因为要防止源节点受边界或方向限制没有被拖动
                if (obj.options.drop !== null) {
                    if (dropping === null) {
                        $.each($(obj.options.drop), function(index, elem) {
                            if (isContain(elem, dragging.offset().left + diffX, dragging.offset().top + diffY)) {
                                dropping = $(elem);
                                dragging.css("cursor", obj.options.dropCursor);
                                dropping.trigger("dragenter", dragging);
                                return;
                            }
                        });
                    } else {
                        if (!isContain(dropping, dragging.offset().left + diffX, dragging.offset().top + diffY)) {
                            dragging.css("cursor", obj.options.dragCursor);
                            dropping.trigger("dragleave", dragging);
                            dropping = null;
                        } else {
                            dropping.trigger("dragover", dragging);
                        }
                    }
                }
            }
            break;

          case "mouseup":
            if (dragging) {
                var xleft = 0, xtop = 0;
                // drop
                if (dropping) {
                    if (!isContain(dropping, dragging)) {
                        dragging.css("left", dropping.offset().left + (dropping.innerWidth() - dragging.outerWidth()) / 2);
                        dragging.css("top", dropping.offset().top + (dropping.innerHeight() - dragging.outerHeight()) / 2);
                    }
                    dropping.trigger("drop", obj.options.dataTransfer);
                }
                // 是否返回
                if (obj.options.revert) {
                    // 代理元素返回源节点处
                    xleft = "-=" + (dragging.offset().left - obj.elem.offset().left) + "px";
                    xtop = "-=" + (dragging.offset().top - obj.elem.offset().top) + "px";
                    dragging.animate({
                        left: xleft,
                        top: xtop
                    }, obj.options.revertDuration, function() {
                        // 删除代理元素 显示源节点
                        obj.elem.css("visibility", "visible");
                        dragging.remove();
                        dragging = null;
                    });
                } else {
                    // 源节点移动到代理元素处
                    xleft = dragging.offset().left - obj.elem.offset().left;
                    xtop = dragging.offset().top - obj.elem.offset().top;
                    if (obj.elem.css("position") === "relative") {
                        obj.elem.css("left", (isNaN(parseInt(obj.elem.css("left"))) ? 0 : parseInt(obj.elem.css("left"))) + xleft);
                        obj.elem.css("top", (isNaN(parseInt(obj.elem.css("top"))) ? 0 : parseInt(obj.elem.css("top"))) + xtop);
                    } else {
                        obj.elem.css("position", "relative");
                        obj.elem.css("left", xleft);
                        obj.elem.css("top", xtop);
                    }
                    // 删除代理元素 显示源节点
                    obj.elem.css("visibility", "visible");
                    dragging.remove();
                    dragging = null;
                }
                // trigger the dragend event 	
                obj.elem.css("cursor", "default");
                obj.elem.trigger("dragend", dropping);
                dropping = null;
            } else if (draggingPre) {
                // 点击而非拖拽时
                obj.elem.css("visibility", "visible");
                obj.proxy.remove();
                draggingPre = false;
            }
            break;
        }
    }
    // some useful function
    // 判断点元素B是否位于元素A内部 or 点(B, C)是否位于A内 or (B, C) width=D, height=F是否位于A内
    function isContain(A, B, C, D, F) {
        var x = 0, y = 0, width = 0, height = 0;
        if (arguments.length == 2) {
            return $(A).offset().left <= $(B).offset().left && $(A).offset().left + $(A).innerWidth() >= $(B).offset().left + $(B).outerWidth() && $(A).offset().top <= $(B).offset().top && $(A).offset().top + $(A).innerHeight() >= $(B).offset().top + $(B).outerHeight();
        }
        // B, C为点坐标
        if (arguments.length == 3) {
            x = B, y = C;
            return $(A).offset().left <= x && $(A).offset().left + $(A).innerWidth() >= x && $(A).offset().top <= y && $(A).offset().top + $(A).innerHeight() >= y;
        }
        if (arguments.length == 5) {
            x = B, y = C, width = D, height = F;
            return $(A).offset().left <= x && $(A).offset().left + $(A).innerWidth() >= x + width && $(A).offset().top <= y && $(A).offset().top + $(A).innerHeight() >= y + height;
        }
    }
    function check(elem, arg) {
        return true;
    }
    Dnd.prototype.open();
    module.exports = Dnd;
});

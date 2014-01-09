define("arale/dnd/1.0.0/dnd-debug", [ "$-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug" ], function(require, exports, module) {
    var Dnd = null;
    var $ = require("$-debug"), Base = require("arale/base/1.1.1/base-debug");
    var uid = 0, // 标识dnd instance的id
    dndArray = [], // 存储dnd instance的数组
    draggingPre = false, // 标识预拖放
    dragging = null, // 当前拖放的代理元素
    dropping = null, // 当前拖放的目标元素
    diffX = 0, diffY = 0, // diffX, diffY记录鼠标点击离源节点的距离
    obj = null, // 存储当前拖放的dnd
    dataTransfer = {};
    // 存储拖放信息, 在dragstart可设置,在drop中可读取
    Dnd = Base.extend({
        attrs: {
            element: {
                value: null,
                readOnly: true
            },
            containment: {
                value: $(document),
                setter: function(val) {
                    return $(val).eq(0);
                }
            },
            proxy: {
                value: null,
                setter: function(val) {
                    if (val === null) {
                        return this.get("element").clone();
                    } else {
                        return $(val).eq(0);
                    }
                }
            },
            drop: {
                value: null,
                setter: function(val) {
                    return $(val);
                }
            },
            disabled: false,
            visible: false,
            axis: false,
            revert: false,
            revertDuration: 500,
            dragCursor: "move",
            dropCursor: "copy",
            zIndex: 9999
        },
        initialize: function(elem, config) {
            var element = null;
            var $elem = $(elem);
            // 检查源节点合法性，初始化
            if ($elem.length === 0 || $elem.get(0).nodeType !== 1) {
                $.error("element error!");
            }
            // 反正 element 只能通过config传递，就不要用 getter，加强性能
            config = $.extend({
                element: $elem.eq(0)
            }, config);
            Dnd.superclass.initialize.call(this, config);
            element = this.get("element");
            if (this.get("proxy") === null) {
                this.set("proxy", element.clone());
            }
            // 记录下源节点初始style
            element.data("style", element.attr("style") || "");
            // 在源节点上存储dnd uid
            element.data("dnd", ++uid);
            dndArray[uid] = this;
        }
    });
    /*
     * 开启页面Dnd功能,绑定鼠标按下、移动、释放以及ecs按下事件
    */
    Dnd.open = function() {
        $(document).on("mousedown mousemove mouseup keydown", handleEvent);
    };
    /*
     * 关闭页面Dnd功能,解绑鼠标按下、移动、释放以及ecs按下事件
    */
    Dnd.close = function() {
        $(document).off("mousedown mousemove mouseup keydown", handleEvent);
    };
    /*
     * 核心部分, 处理鼠标按下、移动、释放以及ecs按下事件, 实现拖放逻辑
    */
    function handleEvent(event) {
        switch (event.type) {
          case "mousedown":
            if (event.which === 1) {
                // 检测并执行预拖放
                executeDragPre({
                    target: event.target,
                    pageX: event.pageX,
                    pageY: event.pageY
                });
                // 阻止默认选中文本
                if (draggingPre === true) {
                    event.preventDefault();
                }
            }
            break;

          case "mousemove":
            if (draggingPre === true) {
                // 开始拖放
                executeDragStart();
            }
            if (dragging !== null) {
                // 根据边界和方向一起判断是否drag并执行
                executeDrag({
                    pageX: event.pageX,
                    pageY: event.pageY
                });
                // 根据dragging和dropping位置来判断
                // 是否要dragenter, dragleave和dragover并执行
                executeDragEnterLeaveOver();
                // 阻止默认选中文本
                event.preventDefault();
            }
            break;

          case "mouseup":
            if (dragging !== null) {
                dragging.css("cursor", "default");
                dragging.focus();
                dragging = null;
                // 根据dropping判断是否drop并执行
                executeDrop();
                // 根据revert判断是否要返回并执行
                executeRevert();
                // 此处传递的dragging为源节点element
                obj.trigger("dragend", obj.get("element"), dropping);
                obj = null;
                dropping = null;
            } else if (draggingPre === true) {
                // 点击而非拖放时
                obj.get("proxy").remove();
                draggingPre = false;
                obj = null;
            }
            break;

          case "keydown":
            if (dragging !== null && event.which === 27) {
                dragging.css("cursor", "default");
                dragging.focus();
                dragging = null;
                // 返回源节点初始位置
                executeRevert(true);
                // 此处传递的dragging为源节点element
                obj.trigger("dragend", obj.get("element"), dropping);
                obj = null;
                dropping = null;
            }
            break;
        }
    }
    /*
     * 鼠标按下触发预拖放
    */
    function executeDragPre(event) {
        var element = null, proxy = null, dnd = null, targetArray = $(event.target).parents().toArray();
        // 查找自身和父元素，判断是否为可拖放元素
        targetArray.unshift(event.target);
        $.each(targetArray, function(index, elem) {
            if ($(elem).data("dnd") !== undefined) {
                dnd = $(elem).data("dnd");
                if (dnd === true) {
                    dnd = new Dnd(elem, $(elem).data("config"));
                } else if (dnd === false) {
                    // dnd为false标识禁止该元素触发拖放
                    dnd = null;
                } else if (isNaN(parseInt(dnd, 10)) === false && parseInt(dnd, 10) > 0) {
                    dnd = dndArray[parseInt(dnd, 10)];
                } else {
                    return true;
                }
                return false;
            }
        });
        // 不允许拖放则返回
        if (dnd === null || dnd.get("disabled") === true) return;
        // 将dnd对象传给当前拖放对象obj
        obj = dnd;
        element = obj.get("element");
        proxy = obj.get("proxy");
        // 设置代理元素proxy，并将其插入文档中
        proxy.css({
            position: "absolute",
            margin: 0,
            left: 0,
            top: 0,
            visibility: "hidden"
        });
        proxy.appendTo(element.parent());
        proxy.data("originx", proxy.offset().left);
        proxy.data("originy", proxy.offset().top);
        proxy.css({
            left: element.offset().left - proxy.data("originx"),
            top: element.offset().top - proxy.data("originy"),
            width: element.css("width")
        });
        diffX = event.pageX - element.offset().left;
        diffY = event.pageY - element.offset().top;
        draggingPre = true;
    }
    /*
     * 鼠标拖动触发拖放
    */
    function executeDragStart() {
        var element = obj.get("element"), proxy = obj.get("proxy"), visible = obj.get("visible"), dragCursor = obj.get("dragCursor"), zIndex = obj.get("zIndex");
        // 按照设置显示或隐藏element
        if (visible !== true) {
            element.css("visibility", "hidden");
        }
        proxy.css({
            "z-index": zIndex,
            visibility: "visible",
            cursor: dragCursor
        });
        proxy.focus();
        dataTransfer = {};
        draggingPre = false;
        dragging = proxy;
        obj.trigger("dragstart", dataTransfer, dragging, dropping);
    }
    /*
     * 根据边界和方向一起判断是否drag并执行
    */
    function executeDrag(event) {
        var containment = obj.get("containment"), axis = obj.get("axis"), xleft = event.pageX - diffX, xtop = event.pageY - diffY, originx = dragging.data("originx"), originy = dragging.data("originy"), offset = containment.offset();
        // containment is document
        // 不用 === 是因为 jquery 版本不同，返回值也不同
        if (!offset) {
            offset = {
                left: 0,
                top: 0
            };
        }
        // 是否在x方向上移动并执行
        if (axis !== "y") {
            if (xleft >= offset.left && xleft + dragging.outerWidth() <= offset.left + containment.outerWidth()) {
                dragging.css("left", xleft - originx);
            } else {
                if (xleft <= offset.left) {
                    dragging.css("left", offset.left - originx);
                } else {
                    dragging.css("left", offset.left + containment.outerWidth() - dragging.outerWidth() - originx);
                }
            }
        }
        // 是否在y方向上移动并执行
        if (axis !== "x") {
            if (xtop >= offset.top && xtop + dragging.outerHeight() <= offset.top + containment.outerHeight()) {
                dragging.css("top", xtop - originy);
            } else {
                if (xtop <= offset.top) {
                    dragging.css("top", offset.top - originy);
                } else {
                    dragging.css("top", offset.top + containment.outerHeight() - dragging.outerHeight() - originy);
                }
            }
        }
        obj.trigger("drag", dragging, dropping);
    }
    /*
     * 根据dragging和dropping位置来判断是否dragenter, dragleave和dragover并执行
    */
    function executeDragEnterLeaveOver() {
        var element = obj.get("element"), drop = obj.get("drop"), dragCursor = obj.get("dragCursor"), dropCursor = obj.get("dropCursor"), xleft = dragging.offset().left + diffX, xtop = dragging.offset().top + diffY;
        if (drop === null) {
            return;
        }
        if (dropping === null) {
            $.each(drop, function(index, elem) {
                if (isContain(elem, xleft, xtop) === true) {
                    dragging.css("cursor", dropCursor);
                    dragging.focus();
                    dropping = $(elem);
                    obj.trigger("dragenter", dragging, dropping);
                    return false;
                }
            });
        } else {
            if (isContain(dropping, xleft, xtop) === false) {
                dragging.css("cursor", dragCursor);
                dragging.focus();
                obj.trigger("dragleave", dragging, dropping);
                dropping = null;
            } else {
                obj.trigger("dragover", dragging, dropping);
            }
        }
    }
    /*
     * 根据dropping判断是否drop并执行
     * 当dragging不在dropping内且不需要revert时, 将dragging置于dropping中央
    */
    function executeDrop() {
        var element = obj.get("element"), xdragging = obj.get("proxy"), revert = obj.get("revert"), originx = xdragging.data("originx"), originy = xdragging.data("originy");
        if (dropping === null) {
            return;
        }
        // 放置时不完全在drop中并且不需要返回的则放置中央
        if (isContain(dropping, xdragging) === false && revert === false) {
            xdragging.css("left", dropping.offset().left + (dropping.outerWidth() - xdragging.outerWidth()) / 2 - originx);
            xdragging.css("top", dropping.offset().top + (dropping.outerHeight() - xdragging.outerHeight()) / 2 - originy);
        }
        // 此处传递的dragging为源节点element
        obj.trigger("drop", dataTransfer, element, dropping);
    }
    /*
     * 根据revert判断是否要返回并执行
     * 若drop(目标元素)不为null且dropping(当前目标元素)为null, 则自动回到原处
     * flag为true表示必须返回的,目前用于esc按下触发返回
     * 处理完移除代理元素
    */
    function executeRevert(flag) {
        var element = obj.get("element"), xdragging = obj.get("proxy"), drop = obj.get("drop"), revert = obj.get("revert"), revertDuration = obj.get("revertDuration"), visible = obj.get("visible"), xleft = xdragging.offset().left - element.offset().left, xtop = xdragging.offset().top - element.offset().top, originx = xdragging.data("originx"), originy = xdragging.data("originy");
        if (revert === true || flag === true || dropping === null && drop !== null) {
            //代理元素返回源节点初始位置
            element.attr("style", element.data("style"));
            if (visible === false) {
                element.css("visibility", "hidden");
            }
            xdragging.animate({
                left: element.offset().left - originx,
                top: element.offset().top - originy
            }, revertDuration, function() {
                element.css("visibility", "");
                xdragging.remove();
            });
        } else {
            // 源节点移动到代理元素处
            if (element.css("position") === "relative") {
                xleft = (isNaN(parseInt(element.css("left"), 10)) ? 0 : parseInt(element.css("left"), 10)) + xleft;
                xtop = (isNaN(parseInt(element.css("top"), 10)) ? 0 : parseInt(element.css("top"), 10)) + xtop;
            } else if (element.css("position") === "absolute") {
                xleft = xdragging.offset().left;
                xtop = xdragging.offset().top;
            } else {
                element.css("position", "relative");
            }
            if (visible === false) {
                element.css({
                    left: xleft,
                    top: xtop,
                    visibility: ""
                });
                xdragging.remove();
            } else {
                // 源节点显示时动画移动到代理元素处
                element.animate({
                    left: xleft,
                    top: xtop
                }, revertDuration, function() {
                    xdragging.remove();
                });
            }
        }
    }
    /*
     * 判断元素B是否位于元素A内部
     * or 点(B, C)是否位于A内
    */
    function isContain(A, B, C) {
        var offset = $(A).offset();
        // A is document
        if (offset === null) {
            offset = {
                left: 0,
                top: 0
            };
        }
        if (arguments.length === 2) {
            return offset.left <= $(B).offset().left && offset.left + $(A).outerWidth() >= $(B).offset().left + $(B).outerWidth() && offset.top <= $(B).offset().top && offset.top + $(A).outerHeight() >= $(B).offset().top + $(B).outerHeight();
        }
        if (arguments.length === 3) {
            return offset.left <= B && offset.left + $(A).outerWidth() >= B && offset.top <= C && offset.top + $(A).outerHeight() >= C;
        }
    }
    Dnd.open();
    module.exports = Dnd;
});

# Dnd

---



---

## 配置说明

### element    element|string
可拖放的元素,即源节点
>注: 非法时抛出异常,其他config参数非法时将自动取默认值

### containment    element|string|null
拖放的边界,只能设置一个,默认null为无边界 
>注: element初始必须要位于containment的内部,否则将默认为null

### axis   'x'|'y'|false
拖放指定的方向,默认false为任意方向

### visible    boolean
被拖放的元素在源位置上是否可见,默认false为不可见

### proxy    element|string|null
代理元素,实际上跟随鼠标移动的元素,默认null为源节点element的clone

### drop    element|string|null
放置元素,可以不止一个,默认null为无

### revert    boolean
是否返回源节点初始位置,默认false为不返回
>注: 当drop不为null并且没有在drop元素上释放鼠标 或者 按下esc取消,将返回源节点初始位置,与revert无关

### revertDuration    number
返回速度,默认为500

### disabled    boolean
是否禁止该元素拖放,默认false为不禁止

### dragCursor    string
拖放过程中没进入放置元素drop时光标形状,默认为"move"

### dropCursor    string
拖放过程中进入放置元素drop时光标的形状,默认为"copy"

### zIndex number
代理元素proxy拖放过程中的z-index, 默认为9999


## API

### Dnd(element, config)
构造函数, element不能为空
>注: element为空会抛出异常, config应为纯粹对象

### set(option, value)
设置配置属性, element不能设置
>注: 一切set设置应在拖放前

### get(option)
获取配置属性
>注: 配置属性为DOM元素的,经过拖放后均返回其jquery对象, proxy将返回源节点的clone元素(配置设置为nul时)

### open()
开启页面的拖放功能
>注: 默认use dnd组件就自动open了

### close()
关闭页面的拖放功能


## 事件

### dragstart  (dataTransfer, dragging, dropping)
dataTransfer为拖放数据, draging为代理元素, dropping为null; 拖放开始时触发（按下鼠标并且至少移动1px), 常用来设置拖放数据dataTransfer
>注: dropping为空,此处为保持参数一致
	
### drag (dragging, dropping)
draging为代理元素, dropping为目标元素
拖放中一直触发,直到鼠标释放
>注: dropping有可能为空

### dragenter (dragging, dropping)
draging为代理元素, dropping为目标元素
鼠标刚进入drop元素中触发

### dragover (dragging, dropping)
draging为代理元素, dropping为目标元素
鼠标在drop元素中移动一直触发

### dragleave (dragging, dropping)
draging为代理元素, dropping为目标元素
鼠标刚离开drop元素中触发
>注: dropping为离开的drop元素

### drop (dataTransfer, dragging, dropping)
draging为源节点元素, dropping为放置元素
鼠标在drop元素中释放时触发, 常用来读取dataTransfer值

### dragend (dragging, dropping)
draging为源节点元素, dropping为放置元素; 
拖放结束后触发, 常和dragleave处理相同, 用来取消dragenter中的设置
>注: 当没触发drop时,dropping为null; 按esc时会取消拖放回到源节点原始位置,但仍会触发dragend


## data-attr实现拖放

###在data-attr上进行配置
data-dnd=true data-config为JSON字符串, 详细见演示
>注: 这种方式不支持dataTransfer和一系列事件, 只是简单拖放













































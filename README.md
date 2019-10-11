# 一个轮播图组件
[点击查看](//www.lkg028.cn/demo/slider/)运行效果
#### HTML结构

```html
<div class="container">
 <div class="slider">
    <ul class="slider-item-group">
      <li class="slider-item">item0</li>
      <li class="slider-item">item1</li>
      <li class="slider-item">item2</li>
    </ul>
    <div class="pagination">
      <span></span>
    </div>
  </div>
</div>
```

#### 实现原理

实现切换：通过调整容器 `.slider-item-group` 的`margin-left`值切换在 `slider` 视口中显示的项目。

循环切换：复制第一个节点到末尾、复制末尾的节点到第一个列表项。当切换到最右边（最左边），`transition`过渡结束后，再瞬间切换到第一项或者第二项。以此来实现循环滚动的效果。

#### 实现了以下功能

1. 过渡动画
2. 自动播放
3. 拖拽切换、点击翻页器跳转
4. 容器宽度变化时，实例会自动调整，使其可以继续运行
5. 通过对触摸事件的检测，兼容了移动端

#### 使用方式

```javascript
new Slider({
    slider: document.querySelector('.slider'),
    pagination: document.querySelector('.pagination'),
    activeIdx = 0,
    autoPlay: true,
    autoPlayDuration: 3000,
    transitionDuration: 500
})
```

参数说明

|        参数        | 必选 |  类型   |                 备注                  |
| :----------------: | :--: | :-----: | :-----------------------------------: |
|       slider       |  是  | Element |             slider的容器              |
|     pagination     |  否  | Element |                翻页器                 |
|     activeIdx      |  否  | Number  |     首次显示的项目（0、1、2···）      |
|      autoPlay      |  否  | Number  |              默认值true               |
|  autoPlayDuration  |  否  | Number  |    自动播放间隔毫秒数，默认为3000     |
| transitionDuration |  否  | Number  | 项目切换过渡动画间隔时间毫秒，默认为0 |

// 定义slider类
class Slider {
  constructor ({slider, pagination = null, activeIdx = 0, autoPlay = true, autoPlayDuration = 2000, transitionDuration = 0}) {
    //  组件容器、项目容器、翻页器容器
    this.slider = slider;
    this.itemGroup = null;
    this.pagination = pagination;

    //  当前项目、视口宽度、项目数量
    this.activeIdx = activeIdx;
    this.width = 0;
    this.length = 0;

    //  自动播放、异步播放任务id
    this.autoPlay = autoPlay;
    this.autoPlayDuration = autoPlayDuration;
    this._intervalId = null;

    //  拖拽相关
    this.mouseDraging = false;
    this.dragStartX = 0;
    this.dragEndX = 0;
    this.deltaX = 0;
    this.transitionDuration = transitionDuration;//  过度动画毫秒数

    //  初始化组件
    this._initKey = true;
    this._init();
  }

  //  初始化实例
  _init () {
    this.width = parseFloat(window.getComputedStyle(this.slider).width);
    this.itemGroup = this.slider.querySelector('.slider-item-group');
    this.length = this.itemGroup.children.length;
    let firstEle = this.itemGroup.firstElementChild,
        lastEle = this.itemGroup.lastElementChild;
    // 设置项目容器的宽度(多出两个宽度，用于前后多复制出的节点)
    this.itemGroup.style.width = this.width * (this.length + 2) + 'px';

    // 复制前后两节点，放在相反位置
    this.itemGroup.insertBefore(lastEle.cloneNode(true), firstEle);
    this.itemGroup.appendChild(firstEle.cloneNode(true));
    
    // 设置项目的宽度
    [...this.itemGroup.children].forEach((item, idx) => {
      item.style.width = this.width + 'px';
    })

    // 设置项目组的初始margin-left
    this._initMarginLeft();
    // 设置过渡动画的毫秒数，异步设置，避免以上设置的margin产生动画
    setTimeout(() => {
      this.itemGroup.style.transitionDuration = this.transitionDuration + 'ms';
    }, 0)
    // 设置分页器
    if (this.pagination) this._initPagination();

    //  是否设置自动播放
    this.autoPlayInit(this.autoPlay);
    //  增加鼠标拖拽事件
    this.itemGroup.addEventListener('mousedown', this._dragStart.bind(this), false);
    this.itemGroup.addEventListener('mousemove', this._dragMove.bind(this), false);
    this.itemGroup.addEventListener('mouseup', this._dragEnd.bind(this), false);
    this.itemGroup.addEventListener('mouseleave', this._dragEnd.bind(this), false);
    window.addEventListener('resize', this._resize.bind(this), true);
  }

  //------其它方法--------------
  //  初次设置margin-left的函数
  _initMarginLeft () {
    this.itemGroup.style.marginLeft = -this.width * (this.activeIdx + 1) + 'px';
    console.log(this.itemGroup.style['marginLeft']);
  }

  //  求出目前的margin-left的数字
  _marginLeft () {
    return parseFloat(window.getComputedStyle(this.itemGroup).marginLeft);
  }

  //  初始化分页器
  _initPagination () {
    let length = this.length;
    let spans = '';
    let i = 0;
    while (length) {
      spans += `<span data-idx="${i++}"></span>`
      length--;
    }
    this.pagination.innerHTML = spans;
    this.pagination.children[this.activeIdx].classList.add('active');
    this.pagination.addEventListener('click' ,(e) => {
      if (e.target.tagName !== 'SPAN') return
      else this.goto(+e.target.dataset['idx'])
    },false)
  }

  //  初始化自动播放
  autoPlayInit (key) {
    if (key) {
      this._intervalId = setInterval(() => {
        this.next();
      }, this.autoPlayDuration)
    }else {
      if (this._intervalId) clearInterval(this._intervalId)
    }
  }

  //  直接到达某一个项目
  goto (idx = 0) {
    let oldMargin = -(this.activeIdx + 1) * this.width;
    let oldActiveId = this.activeIdx;
    this.itemGroup.style.transitionDuration = this.transitionDuration + 'ms'; //
    // 跳转新页有三种情况、向前翻页、向后翻页、本页，goto里面只处理本页的情况
    if (idx === this.activeIdx) {
      this.itemGroup.style.marginLeft = oldMargin + 'px';
    }else {
      if (idx > this.activeIdx) {
        while (idx - oldActiveId) {
          this.next();
          idx--
        }
      }else {
        while (oldActiveId - idx) {
          this.pre();
          idx++;
        }
      } 
    }
  }
  //  翻到下一页
  next () {
    let oldActiveId = this.activeIdx;
    //  恢复动画
    this.itemGroup.style.transitionDuration = this.transitionDuration + 'ms';
    //  检查是否是最后一页①正常页，②最后一页
    this.activeIdx = (this.activeIdx !== this.length - 1) ? oldActiveId + 1 : 0;
    //  正常操作，直接增加margin
    this.itemGroup.style.marginLeft = -(oldActiveId + 2) * this.width + 'px';
    // 如果是最后一个复用节点，异步切换到第一页
    if (oldActiveId + 1 !== this.activeIdx) {
      setTimeout(() => {
        this.itemGroup.style.transitionDuration = '0ms';
        this.itemGroup.style.marginLeft = -(this.activeIdx + 1) * this.width + 'px';
      }, this.transitionDuration)
    }
    //  移动分页器(移动到本页不需要)
    this.pagination.children[oldActiveId].classList.remove('active');
    this.pagination.children[this.activeIdx].classList.add('active');
  }

  //  翻到上一页
  pre () {
    let oldActiveId = this.activeIdx;
    //  恢复动画
    this.itemGroup.style.transitionDuration = this.transitionDuration + 'ms';
    //  检查是否是最后一页①正常页，②最后一页
    this.activeIdx = (this.activeIdx === 0) ? this.length - 1 : oldActiveId - 1;
    //  正常操作，直接减少margin
    this.itemGroup.style.marginLeft = -oldActiveId * this.width + 'px';
    // 如果是已经切换到第一个复用节点，异步切换到最后一页
    if (oldActiveId - 1 !== this.activeIdx) {
      setTimeout(() => {
        this.itemGroup.style.transitionDuration = '0ms';
        this.itemGroup.style.marginLeft = -(this.activeIdx + 1) * this.width + 'px';
      }, this.transitionDuration)
    }
    //  移动分页器(移动到本页不需要)
    this.pagination.children[oldActiveId].classList.remove('active');
    this.pagination.children[this.activeIdx].classList.add('active');
  }

  //  拖拽相关的方法
  _dragStart (e) {
    this.mouseDraging = true;
    e.preventDefault();
  }
  _dragMove (e) {
    if (!this.mouseDraging) return;
    let startMargin = -this.width * (this.activeIdx + 1);
    if (!this.dragStartX) {
      this.dragStartX = e.screenX;
    }
    this.deltaX = e.screenX - this.dragStartX;
    console.log(this.deltaX);
    // 关闭自动播放
    this.autoPlayInit(false);
    // 鼠标跟随
    this.itemGroup.style.transitionDuration = '0ms';
    this.itemGroup.style.marginLeft = startMargin + this.deltaX + 'px';
  }
  _dragEnd () {
    if (!this.mouseDraging || !this.dragStartX) return;
    // 关闭拖拽
    this.mouseDraging = false;
    this.dragStartX = 0;
    //  超过阈值直接跳转
    this.itemGroup.style.transitionDuration = this.transitionDuration + 'ms';
    if (Math.abs(this.deltaX) > this.width * 0.25) {
      if (this.deltaX > 0) this.pre();
      else this.next();
    }else {
      this.goto(this.activeIdx);
    }
    // 恢复自动播放
    setTimeout(() => {
      this.autoPlayInit(this.autoPlay);
    }, 0)
  }
  // _resize,当视口尺寸变化时，重新初始化实例
  _resize () {
    // 关闭自动播放，去掉过渡
    this.autoPlayInit(false);
    this.itemGroup.style.transitionDuration = '0ms';
    //  重新获取宽度并设置宽度
    this.width = parseFloat(window.getComputedStyle(this.slider).width);
    [...this.itemGroup.children].forEach((item, idx) => {
      item.style.width = this.width + 'px';
    })
    // 重新设置margin
    this._initMarginLeft();

    // 恢复过渡，恢复自动播放
    setTimeout(() => {
      this.itemGroup.style.transitionDuration = this.transitionDuration + 'ms';
      this.autoPlayInit(this.autoPlay);
    }, 0)
  }
}




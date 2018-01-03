const compData = {
  stars: [
    0, 0, 0, 0, 0
  ]
};

let selfDefineEvts = {
  inject: function (data) {
    if (data) {
      Object.assign(this, data);
    }
  },
  clickStar (e) {
    var index = e.currentTarget.dataset.index; // 获取当前点击的是第几颗星星
    var key = e.currentTarget.dataset.key; // 获取当前点击的类别

    var tempUserStars = compData.stars; // 暂存星星数组
    var len = tempUserStars.length; // 获取星星数组的长度
    for (var i = 0; i < len; i++) {
      if (i <= index) { // 小于等于index的是满心
        tempUserStars[i] = 1;
      } else { // 其他是空心
        tempUserStars[i] = 0;
      }
    }

    typeof this.getIndex === 'function' &&
    this.getIndex(index, key, tempUserStars);
  }
};

function HandleStar () {
  // 获取当前的页面对象
  const pages = getCurrentPages();
  const curPage = pages[pages.length - 1];

  Object.assign(curPage, selfDefineEvts);
  // 附加到page上
  // 把组件的数据合并到data对象中
  curPage.setData(compData);
  return curPage;
};

export {
  HandleStar
};


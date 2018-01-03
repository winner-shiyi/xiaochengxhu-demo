const _compData = {
  '_toast_.isHide': false,
  '_toast_.content': '有错误哦，等会再试'
};

const toastPanel = {
  showToast: function (data, timeout = 2000) {
    const self = this;
    this.setData({
      '_toast_.isHide': true,
      '_toast_.content': data
    }, () => {
      setTimeout(() => {
        self.setData({
          '_toast_.isHide': false
        });
      }, timeout);
    });
  },
  hideToast: function () {
    this.setData({
      '_toast_.isHide': false
    });
  }
};

function ToastPanel () {
  // 获取当前的页面对象
  const pages = getCurrentPages();
  const curPage = pages[pages.length - 1];
  this._page = curPage;
  Object.assign(curPage, toastPanel);
  // 附加到page上
  curPage.toastPanel = this;
  // 把组件的数据合并到data对象中
  curPage.setData(_compData);
  return this;
};

export {
  ToastPanel
};

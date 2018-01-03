// 获取全局应用程序实例对象
// const app = getApp()

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    categoryTypeArr: [ // tab切换标题
      { name: '去门店取件' },
      { name: '快递员上门' }
    ],
    currentMenuIndex: 0
  },
  /**
   * 模拟tab切换
   */
  changeOrderList (event) {
    const index = event.currentTarget.dataset.index;
    const currentMenuIndex = wx.getStorageSync('currentMenuIndex');

    if (index !== currentMenuIndex) {
      wx.setStorageSync('currentMenuIndex', index);
      const params = {
        pageSize: 10,
        pageNo: 1,
        status: index
      };
      if (!wx.getStorageSync('token')) return;
      this.canLoadData(params, 'down');
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    // TODO: onLoad
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    // TODO: onReady
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    // TODO: onShow
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
    // TODO: onHide
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    // TODO: onUnload
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {
    // TODO: onPullDownRefresh
  }
});

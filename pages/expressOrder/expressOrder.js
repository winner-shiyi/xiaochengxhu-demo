// pages/expressOrder/expressOrder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryTypeArr: [
      { name: '待自提' },
      { name: '配送中' },
      { name: '已完成' },
    ],
    currentMenuIndex: 0,
    loadingHidden: true,
    expressOrderList: [],
    isLoadedAll: false,
    movieLoading: false, // 上拉加载的变量，默认false，隐藏
    moiveLoadingComplete: false //“没有数据”的变量，默认false，隐藏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  /**
   * 模拟tab切换
   */
  changeOrderList: function(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({
      currentMenuIndex: index
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },
  /**
   * 接口获取列表数据 todo
   */
  getExpressOrderData: function () {
    // 
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function (event) {
    var that = this;
    this.data.expressOrderList = [];
    this.getExpressOrderData(() => {
      that.data.isLoadedAll = false;  //是否加载完全
      that.data.pageNo = 1;
      wx.stopPullDownRefresh();
    })
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.isLoadedAll) {
      this.data.pageN += 1;
      this.getExpressOrderData();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
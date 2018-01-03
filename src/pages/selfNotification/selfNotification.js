Page({
  /**
   * 页面的初始数据
   */
  data: {
    storeName: '',
    waybillNo: '',
    expressCompanyName: '',
    areaNum: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.setData({
      storeName: options.key,
      waybillNo: options.key2,
      expressCompanyName: options.key3,
      areaNum: options.key4
    });
  }

});

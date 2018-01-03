import { doRequestWithRefreshingToken } from '../../utils/RequestUtil.js';

// 获取全局应用程序实例对象
// const app = getApp()

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    categoryTypeArr: [ // tab切换标题
      { name: '去门店寄件' },
      { name: '快递员上门' }
    ],
    currentMenuIndex: 0,
    judgeObject: {
      hasStore: true, // 3km内是否有门店
      emptyStoreInStore: true, // 去门店寄件：门店是否有值
      emptySAddressInStore: true, // 去门店寄件：发货地址是否有值
      emptyRSAddressInStore: true, // 去门店寄件：收获地址是否有值
      emptyStoreInDoor: true, // 快递员上门：门店是否有值
      emptyTimeInDoor: true, // 快递员上门：收获地址是否有值
      emptySAddressInDoor: true, // 快递员上门：发货地址是否有值
      emptyRSAddressInDoor: true, // 快递员上门：收获地址是否有值
      
    }
  },
  /**
   * 模拟tab切换
   */
  changeOrderList (event) {
    const index = event.currentTarget.dataset.index;
    const currentMenuIndex = wx.getStorageSync('currentMenuIndex');

    if (index !== currentMenuIndex) {
      wx.setStorageSync('currentMenuIndex', index);
      // const params = {
      //   pageSize: 10,
      //   pageNo: 1,
      //   status: index
      // };
      // if (!wx.getStorageSync('token')) return;
      // this.canLoadData(params, 'down');
      this.setData({
        currentMenuIndex: index,
        isDoor: !this.data.isDoor
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    // const { currentMenuIndex } = this.data;
    wx.setStorageSync('currentMenuIndex', 0);
    // const params = {
    //   pageSize: 10,
    //   pageNo: 1,
    //   status: currentMenuIndex
    // };
    // this.doTokenLoadData(params);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    // TODO: onShow
  },
  _loadData () {
    doRequestWithRefreshingToken({
      isAbsolute: true,
      absUrl: 'http://tubobo-wxserver.dev.ops.com/wxcx/login',
      success: (data) => {

      },
      fail: () => {

      }
    });
  },
  hasStoreFn () {

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

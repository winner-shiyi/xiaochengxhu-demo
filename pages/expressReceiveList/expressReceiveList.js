// import { ExpressReceiveList } from 'ExpressReceiveListModal.js';

import promiseAjax from '../../utils/PromiseAjax.js';

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
    statusData: {
      RECEIVE: '待接单',
      PICKUP: '待取货',
      DISTRIBUTION: '配送中',
      FINISH: '已完成',
      CANCEL: '已退回'
    },
    currentMenuIndex: 0,
    loadingHidden: true,
    orderData: {},
    isLoadedAll: false,
    movieLoading: false, // 上拉加载的变量，默认false，隐藏
    moiveLoadingComplete: false //“没有数据”的变量，默认false，隐藏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const params = {
      pageSize: 10,
      pageNo: 1,
      status: this.data.currentMenuIndex
    };
    this._loadData(() => {},params);
  },
  /**
   * 接口获取列表数据
   * callback：function 数据渲染完成后的回调
   * params：object 请求接口参数
   */
  _loadData: function (callback, params) {  
    console.log('params111---', params);
    promiseAjax.post('wxcx/express/receive/list', params).then((data) => {
      console.log('data111----', data);
      const { totalSize, pageNo, pageSize } = data.resultData;

      this.setData({
        orderData: data.resultData,
        loadingHidden: true,
        isLoadedAll: totalSize < (pageNo * pageSize) // 是否加载完全
      });
      
      callback && callback();
    }).catch((err) => {
      console.log(err);
    });
  },
  /**
   * 模拟tab切换
   */
  changeOrderList: function(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({
      currentMenuIndex: index
    });
    const params = {
      pageSize: 10,
      pageNo: 1,
      status: this.data.currentMenuIndex
    };
    this._loadData(() => {}, params);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  dispatchOrder: function (event) {
    wx.showModal({
      content: '预约配送将有快递小哥送货上门并收取一定的配送费哦',
      success: function (res) {
        if (res.confirm) {
          // 带id跳转
          const id = event.currentTarget.dataset.id;
          console.log('id---', id);
          wx.navigateTo({
            url: `../expressAppoint/expressAppoint?id=${id}`
          });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
  },
  noDispatch: function () {
    wx.showModal({
      content: "该门店暂不支持预约配送哦",
      showCancel: false,
      confirmText: '知道了'
    });
  },
  /**
   * 跳转到订单详情
   */
  onExpressItemTap: function (event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../expressReceiveDetail/expressReceiveDetail?id=${id}`,
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function (event) {
    const params = {
      pageSize: 10,
      pageNo: 1,
      status: this.data.currentMenuIndex
    };
    this._loadData(() => {
      wx.stopPullDownRefresh();
    }, params);
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    // if (!this.data.isLoadedAll) {
    //   // console.log(2545344);
    //   this.data.pageNo += 1;
    //   this._loadData();
    // }
    
    
    let pageNo = 1;
    pageNo += 1;
    const params = {
      pageSize: 10,
      pageNo,
      status: this.data.currentMenuIndex
    };
    this._loadData(() => { }, params);

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
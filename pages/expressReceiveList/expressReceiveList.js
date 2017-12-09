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
    orderList: [],
    pageNo: 1,
    loadingHidden: true,
    LoadingMore: false, // 还有更多数据
    isLoadedAll: false, // 没有更多数据
    isConnectOk: false // 网络状态 或者 服务器返回是否正常
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
    this._loadData(() => {}, params, 'down');
  },
  /**
   * 接口获取列表数据
   * callback:function 数据渲染完成后的回调
   * params:object 请求接口参数
   * type:string ['up'表示上拉加载，'down'表示下拉刷新]
   */
  _loadData: function (callback, params, type) {
    console.log('params111---', params);
    promiseAjax.post('wxcx/express/receive/list', params).then((data) => {
      // console.log('data111----', data);
      
      const { totalSize, pageNo, pageSize, list } = data.resultData;

      const flag = totalSize <= (this.data.pageNo * pageSize);

      console.log('flag---', flag);

      let totalList;
      if (type === 'up') {
        totalList = this.data.orderList.concat(list);
      } else {
        totalList = list;
      }
      
      this.setData({
        orderList: totalList,
        loadingHidden: true,
        isLoadedAll: flag,
        LoadingMore: !flag,
        isConnectOk: true
      });
      
      callback && callback();
    }).catch((err) => {
      console.log('err---', err);
      if (err) {
        if (!this.getCurrentNetwork()) {
          // 非网络问题，而是服务器请求出错的处理
          this.setData({
            isConnectOk: false,
            LoadingMore: false,
            isLoadedAll: false,
          });
          // 浩南toast 提示
          wx.showModal({
            title: '服务器开小差了',
            content: '',
          });
        }
         
      }
    });
  },
  /**
   * 获取当前网络状态
   */
  getCurrentNetwork: function() {
    const that = this;
    let badNet = false;
    wx.getNetworkType({
      success: function (res) {
        const networkType = res.networkType;
        console.log('networkType---', networkType);
        if (networkType === 'none' || networkType === 'unknown') {
          that.setData({
            isConnectOk: false,
            LoadingMore: false,
            isLoadedAll: false,
          });
          // 浩南toast 提示
          badNet = true;
          wx.showModal({
            title: '网络不给力',
            content: '',
          });
        }
      }
    });
    return badNet;
    
  },

  /**
   * 模拟tab切换
   */
  changeOrderList: function(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({
      currentMenuIndex: index,
      pageNo: 1,
      loadingHidden: true,
    });
    const params = {
      pageSize: 10,
      pageNo: 1,
      status: this.data.currentMenuIndex
    };
    this._loadData(() => {}, params, 'down');
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
    this.setData({
      pageNo: 1,
      LoadingMore: false,
      isLoadedAll: false,
    });
    const params = {
      pageSize: 10,
      pageNo: 1,
      status: this.data.currentMenuIndex
    };
    this._loadData(() => {
      wx.stopPullDownRefresh();
    }, params, 'down');
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
    if (!this.data.isLoadedAll) {;
      this.setData({
        pageNo: this.data.pageNo += 1
      });
      const params = {
        pageSize: 10,
        pageNo: this.data.pageNo,
        status: this.data.currentMenuIndex
      };
      this._loadData(() => {}, params, 'up');
    }
  },
})
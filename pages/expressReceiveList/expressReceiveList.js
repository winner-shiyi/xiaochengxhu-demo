'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _RequestUtil = require('../../utils/RequestUtil.js');

// 获取全局应用程序实例对象
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryTypeArr: [// tab切换标题
    { name: '待自提' }, { name: '配送中' }, { name: '已完成' }],
    statusData: { // 快递订单状态
      RECEIVE: '待接单',
      PICKUP: '待取货',
      DISTRIBUTION: '配送中',
      FINISH: '已完成',
      CANCEL: '已退回'
    },
    currentMenuIndex: 0,
    orderList: [],
    pageNo: 1,
    isShowReload: false, // 是否展示【重新加载】按钮
    isLoadedAll: false, // 没有更多数据
    isConnectOk: false // 网络状态 或者 服务器返回是否正常
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var _this = this;

    app.ToastPanel();
    var currentMenuIndex = this.data.currentMenuIndex;

    wx.setStorageSync('currentMenuIndex', 0);
    var params = {
      pageSize: 10,
      pageNo: 1,
      status: currentMenuIndex
    };

    if (wx.getStorageSync('token')) {
      this.canLoadData(params, 'down');
    } else {
      app.tokenReadyCallback = function (data) {
        console.log('token---', data.resultData.token);
        if (data.resultData.token) {
          _this.canLoadData(params, 'down');
        }
      };
    }
  },

  /**
   * 接口获取列表数据
   * params:object 请求接口参数
   * type:string ['up'表示上拉加载，'down'表示下拉刷新]
   *  callback:function 数据渲染完成后的回调，比如是否停止下拉刷新
   */
  _loadData: function _loadData(params, type) {
    var _this2 = this;

    var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

    (0, _RequestUtil.doRequestWithRefreshingToken)({
      // url: 'http://172.16.2.71:8068/mockjsdata/24/wxcx/express/receive/list',
      // isAbsolute: true,
      // absUrl: 'http://tubobo-express.dev.ops.com/wxcx/express/receive/list',
      mode: 'express',
      url: 'wxcx/express/receive/list',
      data: _extends({}, params),
      success: function success(data) {
        var resultData = data.resultData,
            resultCode = data.resultCode,
            resultDesc = data.resultDesc;

        if (resultCode === '0') {
          var totalSize = resultData.totalSize,
              pageSize = resultData.pageSize,
              list = resultData.list;
          var _data = _this2.data,
              pageNo = _data.pageNo,
              orderList = _data.orderList;

          var flag = totalSize <= pageNo * pageSize;
          var totalList = void 0;
          if (type === 'up') {
            totalList = orderList.concat(list);
          } else {
            totalList = list;
          }
          _this2.setData({
            orderList: totalList,
            isLoadedAll: flag,
            LoadingMore: !flag,
            isConnectOk: true,
            currentMenuIndex: params.status,
            pageNo: params.pageNo
          }, callback);
        } else {
          _this2.setData({
            isConnectOk: false,
            LoadingMore: false,
            isLoadedAll: false,
            isShowReload: true
          });
          _this2.showToast(resultDesc);
        }
      },
      fail: function fail() {}
    });
  },

  /**
   * 先判断网络状态后在执行ajax请求
   */
  canLoadData: function canLoadData(params, type, callback) {
    var that = this;
    wx.getNetworkType({
      success: function success(res) {
        var networkType = res.networkType;
        console.log('networkType---', networkType);
        if (networkType === 'none' || networkType === 'unknown') {
          that.setData({
            isConnectOk: false,
            LoadingMore: false,
            isLoadedAll: false,
            isShowReload: true
          });
          that.showToast('网络错误，请重试');
        } else {
          that.setData({
            isShowReload: false
          });
          that._loadData(params, type, callback);
        }
      }
    });
  },

  /**
   * 模拟tab切换
   */
  changeOrderList: function changeOrderList(event) {
    var index = event.currentTarget.dataset.index;
    var currentMenuIndex = this.data.currentMenuIndex;

    if (index !== currentMenuIndex) {
      wx.setStorageSync('currentMenuIndex', index);
      var params = {
        pageSize: 10,
        pageNo: 1,
        status: index
      };
      if (!wx.getStorageSync('token')) return;
      this.canLoadData(params, 'down');
    }
  },

  /**
   * 点击【预约配送】，确定后跳转到预约配送页面
   */
  dispatchOrder: function dispatchOrder(event) {
    wx.showModal({
      content: '预约配送将有快递小哥送货上门并收取一定的配送费哦',
      success: function success(res) {
        if (res.confirm) {
          var _event$currentTarget$ = event.currentTarget.dataset,
              id = _event$currentTarget$.id,
              waybillno = _event$currentTarget$.waybillno,
              storename = _event$currentTarget$.storename,
              expresscompanyname = _event$currentTarget$.expresscompanyname;

          wx.setStorageSync('expressId', id);
          wx.setStorageSync('waybillNo', waybillno);
          wx.setStorageSync('storeName', storename);
          wx.setStorageSync('expressCompanyName', expresscompanyname);

          wx.navigateTo({
            url: '../expressAppoint/expressAppoint?id=' + id
          });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
  },

  /**
   * 点击置灰的【预约配送】，不做跳转
   */
  noDispatch: function noDispatch() {
    wx.showModal({
      content: '该门店暂不支持预约配送哦',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 跳转到订单详情
   */
  onExpressItemTap: function onExpressItemTap(event) {
    var id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../expressReceiveDetail/expressReceiveDetail?id=' + id
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh(event) {
    var currentMenuIndex = this.data.currentMenuIndex;

    this.setData({
      pageNo: 1,
      LoadingMore: false,
      isLoadedAll: false
    });
    var params = {
      pageSize: 10,
      pageNo: 1,
      status: currentMenuIndex
    };
    if (!wx.getStorageSync('token')) return;
    this.canLoadData(params, 'down', function () {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {
    var currentMenuIndex = this.data.currentMenuIndex;

    if (!this.data.isLoadedAll) {
      this.setData({
        pageNo: this.data.pageNo += 1
      });
      var params = {
        pageSize: 10,
        pageNo: this.data.pageNo,
        status: currentMenuIndex
      };
      this.canLoadData(params, 'up');
    }
  }
});
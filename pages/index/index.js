'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _util = require('../../utils/util.js');

var _RequestUtil = require('../../utils/RequestUtil.js');

// 获取全局应用程序实例对象
var app = getApp();

var cancelReasonData = {
  GRAB_OVERTIME_CANCEL: '很抱歉，由于配送员未接单，您的预约配送任务已取消',
  GRAB_SENDER_CANCEL: '您已取消预约配送任务',
  PAY_OVERTIME_CANCEL: '由于超时未支付，您的预约配送任务已被取消',
  ADMIN_CANCEL: '很抱歉，您的预约配送任务已被运营平台取消',
  PAY_SENDER_CANCEL: '您已取消预约配送任务',
  PICK_RIDER_CANCEL: '很抱歉，由于配送员个人原因，您的预约配送任务已被取消',
  PICK_SENDER_CANCEL: '接单后主动取消',
  STORE_CANCEL: '由于门店取消'
};

Page({
  data: {
    myExpressData: {},
    cancelText: '',
    isEmpty: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad() {
    var _this = this;

    app.ToastPanel();
    if (wx.getStorageSync('token')) {
      this._loadData();
    } else {
      app.tokenReadyCallback = function (data) {
        if (data.resultData.token) {
          _this._loadData();
        }
      };
    }
  },
  /**
   * 接口获取数据
   * callback:function 数据渲染完成后的回调，比如是否停止下拉刷新
   */
  _loadData: function _loadData() {
    var _this2 = this;

    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

    var that = this;
    (0, _RequestUtil.doRequestWithRefreshingToken)({
      // isAbsolute: true,
      // absUrl: 'http://172.16.2.71:8068/mockjsdata/24/wxcx/search/message',
      // absUrl: 'http://tubobo-express.dev.ops.com/wxcx/search/message',
      mode: 'express',
      url: 'wxcx/search/message',
      success: function success(data) {
        console.log('不惑的库data-index---', data);
        var resultData = data.resultData,
            resultCode = data.resultCode,
            resultDesc = data.resultDesc;

        if (resultCode === '0') {
          var tempData = void 0;
          if (resultData.myExpress) {
            tempData = _extends({}, resultData.myExpress);
            var _resultData$myExpress = resultData.myExpress,
                inTime = _resultData$myExpress.inTime,
                cancelReason = _resultData$myExpress.cancelReason;

            tempData.date = (0, _util.formatDate)(inTime, 'MM-dd');
            tempData.cancelText = cancelReasonData[cancelReason];
          }
          if (!(0, _util.isEmptyObject)(tempData)) {
            _this2.setData({
              isEmpty: false
            });
          }
          _this2.setData({
            myExpressData: tempData
          }, callback);
        } else {
          that.showToast(resultDesc);
        }
      }
    });
  },

  /**
   * 跳转到快递列表
   */
  onMyExpressTap: function onMyExpressTap() {
    var _this3 = this;

    this.getNetWorkFn(function () {
      _this3.noTokenFn('../expressReceiveList/expressReceiveList');
    });
  },

  /**
  * 跳转到个人中心
  */
  onMyProfileTap: function onMyProfileTap() {
    var _this4 = this;

    this.getNetWorkFn(function () {
      _this4.noTokenFn('../myProfile/myProfile');
    });
  },

  /**
   * 没有获得token的时候，引导用户开启设置获得userinfo成功后跳转到绑定手机号页面
   */
  noTokenFn: function noTokenFn(navigateUrl) {
    var token = wx.getStorageSync('token');
    if (token) {
      wx.switchTab({
        url: navigateUrl
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '哎呀，兔波波无法获取您的微信信息，需要同意授权才能正常使用哦。',
        showCancel: false,
        confirmText: '授权',
        confirmColor: '#1aad19',
        success: function success(res) {
          if (res.confirm) {
            wx.openSetting({
              success: function success(settingRes) {
                console.log('openSetting---', settingRes);
                if (settingRes.authSetting['scope.userInfo']) {
                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                  wx.getUserInfo({
                    success: function success(userRes) {
                      console.log('========getUserInfo========', userRes);
                      wx.setStorageSync('userInfo', userRes.userInfo);
                    }
                  });
                  wx.redirectTo({
                    url: '/pages/phoneBind/phoneBind'
                  });
                }
              }
            });
          }
        }
      });
    }
  },

  /**
   * 跳转到订单详情
   */
  onExpressItemTap: function onExpressItemTap(event) {
    this.getNetWorkFn(function () {
      var token = wx.getStorageSync('token');
      if (!token) return;
      var id = event.currentTarget.dataset.id;
      wx.navigateTo({
        url: '../expressReceiveDetail/expressReceiveDetail?id=' + id
      });
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh(event) {
    var _this5 = this;

    this.getNetWorkFn(function () {
      if (!wx.getStorageSync('token')) return;
      _this5._loadData(function () {
        wx.stopPullDownRefresh();
      });
    });
  },

  /**
   * 获取当前网络状态
   */
  getNetWorkFn: function getNetWorkFn(callback) {
    var that = this;
    wx.getNetworkType({
      success: function success(res) {
        var networkType = res.networkType;
        console.log('networkType---', networkType);
        if (networkType === 'none' || networkType === 'unknown') {
          that.showToast('网络错误，请检查网络后重试');
        } else {
          callback();
        }
      }
    });
  }
});
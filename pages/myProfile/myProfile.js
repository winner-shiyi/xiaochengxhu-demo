'use strict';

var _util = require('../../utils/util.js');

var _RequestUtil = require('../../utils/RequestUtil.js');

// 获取全局应用程序实例对象
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalVisible: false,
    userInfoData: {},
    userName: '',
    canSubmit: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var _this = this;

    app.ToastPanel();
    if (wx.getStorageSync('token')) {
      this._loadData();
    } else {
      app.tokenReadyCallback = function (data) {
        console.log('token---', data.resultData.token);
        if (data.resultData.token) {
          _this._loadData();
        }
      };
    }
  },

  /**
   * 接口获取数据
   */
  _loadData: function _loadData() {
    var _this2 = this;

    var that = this;
    (0, _RequestUtil.doRequestWithRefreshingToken)({
      // url: 'http://172.16.2.71:8068/mockjsdata/24/wx/tuboboUser/userInfo',
      // isAbsolute: true,
      // absUrl: 'http://tubobo-wxserver.dev.ops.com/wx/tuboboUser/userInfo',
      mode: 'wxserver',
      url: 'wx/tuboboUser/userInfo',
      success: function success(data) {
        console.log('不惑的库data-userinfo---', data);
        var resultData = data.resultData,
            resultCode = data.resultCode,
            resultDesc = data.resultDesc;

        if (resultCode === '0') {
          _this2.setData({
            userInfoData: resultData,
            userName: resultData.nickName
          });
        } else {
          that.showToast(resultDesc);
        }
      }
    });
  },

  /**
   * 显示自定义模态框
   */
  showModal: function showModal(event) {
    var _this3 = this;

    this.getNetWorkFn(function () {
      if (!wx.getStorageSync('token')) return;
      _this3.setData({
        modalVisible: true
      });
    });
  },

  /**
   * 隐藏自定义模态框
   */
  hideModal: function hideModal() {
    this.setData({
      modalVisible: false,
      canSubmit: true
    });
  },

  /**
   * todo textarea怎么阻止touchmove
   */
  preventTouchMove: function preventTouchMove() {
    console.log(111);
  },

  /**
   * 修改昵称，监听输入变化
   */
  changeName: function changeName(event) {
    var newName = event.detail.value;
    this.setData({
      userName: newName
    });
    if (!newName.length) {
      this.setData({
        canSubmit: false
      });
    } else {
      this.setData({
        canSubmit: true
      });
    }
  },

  /**
   * 提交修改后的昵称
   */
  bindFormSubmit: function bindFormSubmit(event) {
    var _this4 = this;

    this.getNetWorkFn(function () {
      var newName = event.detail.value.textarea;
      if (!(0, _util.utilTrim)(newName)) {
        _this4.setData({
          canSubmit: false
        });
        _this4.showToast('修改失败，请输入昵称');
      } else {
        (0, _RequestUtil.doRequestWithRefreshingToken)({
          // url: 'http://172.16.2.71:8068/mockjsdata/24/wx/tuboboUser/updateNickName',
          // url: 'http://tubobo-wxserver.dev.ops.com/wx/tuboboUser/updateNickName',
          mode: 'wxserver',
          url: 'wx/tuboboUser/updateNickName',
          data: { nickName: (0, _util.utilTrim)(newName) },
          success: function success(data) {
            console.log('不惑的库data-updateNickName---', data);
            _this4.setData({
              modalVisible: false
            });
            _this4._loadData();
          }
        });
      }
    });
  },

  /**
   * 查看优惠券
   */
  onCouponTap: function onCouponTap() {
    this.showToast('即将上线，敬请期待');
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
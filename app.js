'use strict';

var _RequestUtil = require('./utils/RequestUtil.js');

/**
 * WeChat API 模块
 * @type {Object}
 * 用于将微信官方`API`封装为`Promise`方式
 * > 小程序支持以`CommonJS`规范组织代码结构
 */

var wechat = require('./utils/wechat');
var infoValidator = require('./utils/InfoValidator');

var _require = require('./components/customizedToast/customizedToast'),
    ToastPanel = _require.ToastPanel;

var RequestUtil = require('./utils/RequestUtil');

var _require2 = require('./components/evaluateComponent/evaluateComponent'),
    HandleStar = _require2.HandleStar;

App({
  /**
   * Global shared
   * 可以定义任何成员，用于在整个应用中共享
   */
  data: {
    name: 'Douban Movie',
    version: '0.1.0',
    currentCity: '北京'
  },

  /**
   * WeChat API
   */
  wechat: wechat,

  /**
   * 验证 API
   */
  infoValidator: infoValidator,

  /**
   * 验证 自定义toast
   */
  ToastPanel: ToastPanel,

  /**
   * 验证
   */
  HandleStar: HandleStar,
  RequestUtil: RequestUtil,
  /**
   * 生命周期函数--监听小程序初始化
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function onLaunch() {
    this.getTokenFromServer();
  },
  getTokenFromServer: function getTokenFromServer() {
    var _this = this;

    var that = this;
    // 微信授权登录
    wx.login({
      success: function success(loginRes) {
        (0, _RequestUtil.doRequestWithRefreshingToken)({
          // isAbsolute: true,
          // absUrl: 'http://172.16.2.71:8068/mockjsdata/24/wxcx/login',
          // isAbsolute: true,
          // absUrl: 'http://tubobo-wxserver.dev.ops.com/wxcx/login',
          mode: 'wxserver',
          url: 'wxcx/login',
          data: { code: loginRes.code },
          success: function success(data) {
            console.log('不惑的库data-授权login----', data.resultData);
            console.log('不惑的库失效token-code', _this.globalData.g_invalid_token_code);
            var resultData = data.resultData,
                resultCode = data.resultCode;

            if (resultCode === '0') {
              var unionId = resultData.unionId,
                  openId = resultData.openId,
                  newUser = resultData.newUser,
                  token = resultData.token;
              // step1. updateStorageSync

              wx.setStorageSync('token', token);
              wx.setStorageSync('unionId', unionId);
              wx.setStorageSync('openId', openId);
              // step2. call tokenReadyCallback is exists
              // 由于 g_token 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (that.tokenReadyCallback) {
                that.tokenReadyCallback(data);
              }
              // step3. fetch user info and display into homepage
              if (newUser) {
                that.getUserInfoFn();
              }
            }
          }
        });
      }
    });
  },
  getUserInfoFn: function getUserInfoFn() {
    wx.getUserInfo({
      success: function success(userRes) {
        console.log('用户信息---', userRes.userInfo);
        // 把用户信息保存到wx的storage中
        wx.setStorageSync('userInfo', userRes.userInfo);
        // 重定向这个跳转是异步操作，为了确保成功执行，放在这个success里执行
        wx.redirectTo({
          url: '/pages/phoneBind/phoneBind'
        });
      },
      fail: function fail() {}
    });
  },

  globalData: {
    g_token: null
  }

});
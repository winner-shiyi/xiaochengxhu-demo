import { doRequestWithRefreshingToken } from './utils/RequestUtil.js';
/**
 * WeChat API 模块
 * @type {Object}
 * 用于将微信官方`API`封装为`Promise`方式
 * > 小程序支持以`CommonJS`规范组织代码结构
 */

const wechat = require('./utils/wechat');
const infoValidator = require('./utils/InfoValidator');
const { ToastPanel } = require('./components/customizedToast/customizedToast');
const RequestUtil = require('./utils/RequestUtil');
const { HandleStar } = require('./components/evaluateComponent/evaluateComponent');
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
  onLaunch () {
    // this.getTokenFromServer();
  },
  /**
   * 调起微信授权登录成功后，再和我们的服务器交互
   */
  getTokenFromServer () {
    const that = this;
    // 微信授权登录
    wx.login({
      success: (loginRes) => {
        const code = loginRes.code;
        if (code) {
          wx.getUserInfo({
            success (userRes) {
              console.log('用户信息111111---', userRes);
              that.doLoginAjax(userRes, code);
            },
            fail () {
              console.log('用户拒绝微信授权登录');
              wx.redirectTo({
                url: '/pages/error/error'
              });
            }
          });
        }
      },
      fail: (err) => {
        console.log('调用wx.login失败', err);
      }
    });
  },
  /**
   * 和我们的服务端交互，老用户直接获取token，新用户绑定手机后获取token
   * @param userRes wx.getUserInfo成功的回调里返回的data对象
   * @param code wx.login成功的回调里返回的code，需要提交给后端
   */
  doLoginAjax (userRes, code) {
    doRequestWithRefreshingToken({
      mode: 'wxserver',
      url: 'wxcx/login',
      data: {
        encryptedData: userRes.encryptedData,
        iv: userRes.iv,
        code: code
      },
      success: (data) => {
        console.log('不惑的库data-授权login----', this);
        const {resultData, resultCode} = data;
        if (resultCode === '0') {
          const {unionId, openId, newUser, token} = resultData;
          // 第一步：把数据保存到缓存
          wx.setStorageSync('token', token);
          wx.setStorageSync('unionId', unionId);
          wx.setStorageSync('openId', openId);
          // 第二步：把callback挂在app上面
          // 由于 g_token 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (this.tokenReadyCallback) {
            this.tokenReadyCallback(data);
          }
          // 第三步：根据是否新用户不同跳转
          if (newUser) {
            wx.setStorageSync('userInfo', userRes.userInfo);
            // 重定向这个跳转是异步操作，为了确保成功执行，放在这个success里执行
            wx.redirectTo({
              url: '/pages/phoneBind/phoneBind'
            });
          } else {
            console.log('重新授权登录，我不是新用户')
            wx.switchTab({
              url: '/pages/index/index'
            });
          }
        }
      }
    });
  },
  globalData: {
    g_token: null
  }
});

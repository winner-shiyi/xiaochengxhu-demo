import { doRequestWithRefreshingToken } from '../../utils/RequestUtil';
// 获取全局应用程序实例对象
const app = getApp();


// 创建页面实例对象
Page({
  data: {},
  /**
   * 调起微信授权登录成功后，保证用户手动设置允许授权后，再和我们的服务器交互
   */
  again () {
    const that = this;
    wx.login({
      success: (loginRes) => {
        const code = loginRes.code;
        if (code) {
          wx.openSetting({
            success: (settingRes) => {
              if (settingRes.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: (userRes) => {
                    console.log('用户信息22222---', userRes);
                    that.doLoginAjax(userRes, code);
                  },
                });
              }
            },
          });
        }
      },
      fail: (err) => {
        console.log('调用wx.login失败', err);
      },
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
        code: code,
      },
      success: (data) => {
        console.log('不惑的库data-授权login----', this);
        const { resultData, resultCode } = data;
        if (resultCode === '0') {
          const {
            unionId, openId, newUser, token,
          } = resultData;
          // 第一步：把数据保存到缓存
          wx.setStorageSync('token', token);
          wx.setStorageSync('unionId', unionId);
          wx.setStorageSync('openId', openId);
          // 第二步：把callback挂在app上面
          // 由于 g_token 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (app.tokenReadyCallback) {
            app.tokenReadyCallback(data);
          }
          // 第三步：根据是否新用户不同跳转
          if (newUser) {
            wx.setStorageSync('userInfo', userRes.userInfo);
            // 重定向这个跳转是异步操作，为了确保成功执行，放在这个success里执行
            wx.redirectTo({
              url: '/pages/phoneBind/phoneBind',
            });
          } else {
            console.log('重新授权登录，我不是新用户');
            wx.switchTab({
              url: '/pages/index/index',
            });
          }
        }
      },
    });
  },
});

import { doRequestWithRefreshingToken } from '../../utils/RequestUtil';
// 获取全局应用程序实例对象
const app = getApp();
const { validateByRule } = app.infoValidator;

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    code: '',
    isPhone: false,
    isVerifyCode: false,
    canSend: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    app.ToastPanel();
  },
  /**
   * 监听手机号输入
   * @param {any} e
   */
  phoneChange (e) {
    const { value } = e.detail;
    const pos = e.detail.cursor;
    this.setData({
      phone: value,
    });
    const isPhone = validateByRule({
      type: 'isMobile',
      data: {
        currentValue: value,
      },
    }).success;
    if (pos === 11 && isPhone) {
      this.setData({
        isPhone: true,
      });
    } else {
      this.setData({
        isPhone: false,
      });
    }
  },
  /**
   * 手机号输入失焦后验证
   * @param {any} e
   */
  phoneBlur (e) {
    const { value } = e.detail;
    const isPhone = validateByRule({
      type: 'isMobile',
      data: {
        currentValue: value,
      },
    }).success;
    this.setData({
      phone: value,
      isPhone,
    });
    this.checkPhone();
  },
  checkPhone () {
    const {
      isPhone,
    } = this.data;
    if (!isPhone) {
      this.showToast('请输入正确的手机号');
    }
  },
  /**
   * 监听验证码输入
   * @param {any} e
   */
  codeChange (e) {
    const { value } = e.detail;
    const pos = e.detail.cursor;
    this.setData({
      code: value,
    });
    const isPhone = validateByRule({
      type: 'isVerifyCode',
      data: {
        currentValue: value,
      },
    }).success;
    if (pos === 6 && isPhone) {
      this.setData({
        isVerifyCode: true,
      });
    } else {
      this.setData({
        isVerifyCode: false,
      });
    }
  },
  /**
   * 验证码输入失焦后验证
   * @param {any} e
   */
  codeBlur (e) {
    const { value } = e.detail;
    const isVerifyCode = validateByRule({
      type: 'isVerifyCode',
      data: {
        currentValue: value,
      },
    }).success;
    this.setData({
      code: value,
      isVerifyCode,
    });
    this.checkCode();
  },
  checkCode () {
    const {
      isVerifyCode,
    } = this.data;
    if (!isVerifyCode) {
      this.showToast('请输入正确的验证码');
    }
  },
  /**
   * 点击发送验证码
   */
  sendVerifyCode () {
    const that = this;
    if (this.data.isPhone) {
      doRequestWithRefreshingToken({
        mode: 'wxserver',
        url: 'wx/tuboboUser/sendSms',
        data: {
          phone: this.data.phone,
          openId: wx.getStorageSync('openId'),
          type: 'XCX',
        },
        success: (data) => {
          const { resultCode, resultDesc } = data;
          if (that.isResultSuccessful(resultCode)) {
            // console.log('不惑的库data-sendSms=====', data);
            this.setData({
              canSend: false,
            });
            let countDownTime = 60;
            this.setData({
              countDownTime,
            });
            const timer = setInterval(() => {
              --countDownTime;
              this.setData({
                countDownTime,
              });
              if (!countDownTime) {
                clearInterval(timer);
                this.setData({
                  canSend: true,
                });
              }
            }, 1000);
          } else {
            that.showToast(resultDesc);
          }
        },
      });
    }
  },
  /**
   * 登录
   */
  onLoginTap () {
    const {
      isPhone,
      isVerifyCode,
      phone,
      code,
    } = this.data;
    if (!isPhone) {
      this.checkPhone();
      return;
    }
    if (!isVerifyCode) {
      this.checkCode();
      return;
    }
    const userInfo = wx.getStorageSync('userInfo');
    const {
      nickName,
      gender,
      city,
      province,
      country,
      avatarUrl,
    } = userInfo;
    const that = this;
    doRequestWithRefreshingToken({
      // isAbsolute: true,
      // absUrl: 'http://172.16.2.71:8068/mockjsdata/24/wxcx/tuboboUser/bindPhone',
      // absUrl: 'http://tubobo-wxserver.dev.ops.com/wxcx/tuboboUser/bindPhone',
      mode: 'wxserver',
      url: 'wxcx/tuboboUser/bindPhone',
      data: {
        sex: gender,
        phone,
        code,
        province,
        nickName,
        city,
        unionId: wx.getStorageSync('unionId'),
        country,
        xcxOpenId: wx.getStorageSync('openId'),
        avatarUrl,
      },
      success: (data) => {
        // console.log('不惑的库data-绑定手机bindPhone---', data);
        const { resultData, resultCode, resultDesc } = data;
        // 绑定手机成功登录后，把token存到storage中
        if (that.isResultSuccessful(resultCode)) {
          wx.setStorageSync('token', resultData.token);
          wx.switchTab({
            url: '../index/index',
          });
        } else {
          that.showToast(resultDesc);
        }
      },
    });
  },
  isResultSuccessful (code) {
    return parseInt(code, 10) === 0;
  },
});

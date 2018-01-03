import { utilTrim } from '../../utils/util.js';
import { doRequestWithRefreshingToken } from '../../utils/RequestUtil.js';
// 获取全局应用程序实例对象
const app = getApp();

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
  onLoad (options) {
    app.ToastPanel();
    this.doTokenLoadData();
  },
  onShow () {
    wx.setStorageSync('currentMenuIndex', 0);
  },
  /**
   * 保证只有拿到token之后才会发起ajax请求
   */
  doTokenLoadData () {
    if (wx.getStorageSync('token')) {
      this._loadData();
    } else {
      app.tokenReadyCallback = data => {
        // console.log('token---', data.resultData.token);
        if (data.resultData.token) {
          this._loadData();
        }
      };
    }
  },
  /**
   * 接口获取数据
   */
  _loadData () {
    const that = this;
    doRequestWithRefreshingToken({
      mode: 'wxserver',
      url: 'wx/tuboboUser/userInfo',
      success: (data) => {
        console.log('不惑的库data-userinfo---', data);
        const {resultData, resultCode, resultDesc} = data;
        if (resultCode === '0') {
          this.setData({
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
  showModal (event) {
    this.getNetWorkFn(() => {
      if (!wx.getStorageSync('token')) return;
      this.setData({
        modalVisible: true
      });
    });
  },
  /**
   * 隐藏自定义模态框
   */
  hideModal () {
    this.setData({
      modalVisible: false,
      canSubmit: true
    });
  },
  /**
   * todo textarea怎么阻止touchmove
   */
  preventTouchMove () {
  },
  /**
   * 修改昵称，监听输入变化
   */
  changeName (event) {
    let newName = event.detail.value;
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
  bindFormSubmit (event) {
    this.getNetWorkFn(() => {
      const newName = event.detail.value.textarea;
      if (!utilTrim(newName)) {
        this.setData({
          canSubmit: false
        });
        this.showToast('修改失败，请输入昵称');
      } else {
        doRequestWithRefreshingToken({
          mode: 'wxserver',
          url: 'wx/tuboboUser/updateNickName',
          data: { nickName: utilTrim(newName) },
          success: (data) => {
            console.log('不惑的库data-updateNickName---', data);
            this.setData({
              modalVisible: false
            });
            this._loadData();
          }
        });
      }
    });
  },
  /**
   * 查看优惠券
   */
  onCouponTap () {
    this.showToast('即将上线，敬请期待');
  },
  /**
   * 获取当前网络状态
   */
  getNetWorkFn (callback) {
    const that = this;
    wx.getNetworkType({
      success: function (res) {
        const networkType = res.networkType;
        if (networkType === 'none' || networkType === 'unknown') {
          that.showToast('网络错误，请检查网络后重试');
        } else {
          callback();
        }
      }
    });
  }

});

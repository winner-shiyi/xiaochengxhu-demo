import { formatDate } from '../../utils/util.js';
import { doRequestWithRefreshingToken } from '../../utils/RequestUtil.js';
// 获取全局应用程序实例对象
const app = getApp();

const cancelReasonData = {
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
  onLoad: function () {
    app.ToastPanel();
    this.doTokenLoadData();
  },
  onShow () {
    wx.setStorageSync('currentMenuIndex', 0);
    this.doTokenLoadData();
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
   * callback:function 数据渲染完成后的回调，比如是否停止下拉刷新
   */
  _loadData (callback = function () {}) {
    const that = this;
    doRequestWithRefreshingToken({
      mode: 'express',
      url: 'wxcx/search/message',
      success: (data) => {
        // console.log('不惑的库data-message---', data);
        const {resultData, resultCode, resultDesc} = data;
        if (resultCode === '0') {
          let tempData;
          if (resultData.myExpress) {
            tempData = {...resultData.myExpress};
            const { inTime, cancelReason } = resultData.myExpress;
            tempData.date = formatDate(inTime, 'MM-dd');
            tempData.cancelText = cancelReasonData[cancelReason];
          }
          if (resultData.myExpress.expressId) {
            this.setData({
              isEmpty: false
            });
          } else {
            this.setData({
              isEmpty: true
            });
          }
          this.setData({
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
  onMyExpressTap () {
    this.getNetWorkFn(() => {
      this.noTokenFn('../expressReceiveList/expressReceiveList');
    });
  },
  /**
 * 跳转到个人中心
 */
  onMyProfileTap () {
    this.getNetWorkFn(() => {
      this.noTokenFn('../myProfile/myProfile');
    });
  },
  /**
   * 没有获得token的时候，引导用户开启设置获得userinfo成功后跳转到绑定手机号页面
   */
  noTokenFn (navigateUrl) {
    const token = wx.getStorageSync('token');
    if (token) {
      wx.switchTab({
        url: navigateUrl
      });
    }
  },
  /**
   * 跳转到订单详情
   */
  onExpressItemTap (event) {
    this.getNetWorkFn(() => {
      const token = wx.getStorageSync('token');
      if (!token) return;
      const id = event.currentTarget.dataset.id;
      wx.navigateTo({
        url: `../expressReceiveDetail/expressReceiveDetail?id=${id}`
      });
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh (event) {
    this.getNetWorkFn(() => {
      if (!wx.getStorageSync('token')) return;
      this._loadData(() => {
        wx.stopPullDownRefresh();
      });
    });
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

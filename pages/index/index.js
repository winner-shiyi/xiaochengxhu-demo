import promiseAjax from '../../utils/PromiseAjax.js';
const app = getApp();

const cancelReason = {
  GRAB_OVERTIME_CANCEL: "超时未接单取消",
  GRAB_SENDER_CANCEL: "未接单时主动取消",
  PAY_OVERTIME_CANCEL: "支付超时取消",
  ADMIN_CANCEL: "后台取消",
  PAY_SENDER_CANCEL: "未支付主动取消",
  PICK_RIDER_CANCEL: "骑手主动取消",
  PICK_SENDER_CANCEL: "接单后主动取消"
}

// wxcx/search/message
Page({
  data: {
    loadingHidden: true,
    myExpressData: {}
  },
  //事件处理函数
  onMyExpressTap: function() {
    wx.navigateTo({
      url: '../expressReceiveList/expressReceiveList'
    })
  },
  onLoad: function () {
    this._loadData();
  },
  _loadData: function (callback) {
    const params = {
      pageSize: 10,
      pageNo: 1,
      status: 0
    };
    promiseAjax.post('wxcx/search/message', params).then((data) => {
      console.log('data----', data);
      this.setData({
        myExpressData: data.resultData.myExpress,
        loadingHidden: true,
      });
      callback && callback();
    }).catch((err) => {
      console.log(err);
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function (event) {
    this._loadData(() => {
      wx.stopPullDownRefresh();
    });

  },
})

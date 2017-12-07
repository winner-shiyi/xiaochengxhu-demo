import promiseAjax from '../../utils/PromiseAjax.js';
import { formatDate } from '../../utils/util.js';

const app = getApp();

const cancelReasonData = {
  GRAB_OVERTIME_CANCEL: "很抱歉，由于配送员未接单，您的预约配送任务已取消",
  GRAB_SENDER_CANCEL: "您已取消预约配送任务",
  PAY_OVERTIME_CANCEL: "由于超时未支付，您的预约配送任务已被取消",
  ADMIN_CANCEL: "很抱歉，您的预约配送任务已被平台取消",
  PAY_SENDER_CANCEL: "您已取消预约配送任务",
  PICK_RIDER_CANCEL: "很抱歉，由于配送员个人原因，您的预约配送任务已被取消",
  PICK_SENDER_CANCEL: "接单后主动取消"
}

Page({
  data: {
    loadingHidden: true,
    myExpressData: {},
    cancelText: ''
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
    const params = {};
    promiseAjax.post('wxcx/search/message', params).then((data) => {
      console.log('data----', data);

      const tempData = {...data.resultData.myExpress};
      const { inTime, cancelReason } = data.resultData.myExpress;
      tempData.date = formatDate(inTime, "MM-dd");
      tempData.cancelText = cancelReasonData[cancelReason];
        
      this.setData({
        myExpressData: tempData,
        loadingHidden: true,
      });
      callback && callback();
    }).catch((err) => {
      console.log('请求出错啦');
    });
  },
  /**
   * 跳转到订单详情
   */
  onExpressItemTap: function (event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../expressReceiveDetail/expressReceiveDetail?id=${id}`,
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

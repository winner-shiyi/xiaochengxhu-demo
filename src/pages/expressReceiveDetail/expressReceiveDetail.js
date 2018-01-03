import { formatDate } from '../../utils/util.js';
import {doRequestWithRefreshingToken} from '../../utils/RequestUtil.js';
const Util = require('../../utils/util');
// 获取全局应用程序实例对象
const app = getApp();
const curCancel = {
  Empty: {
    textDesc: ''
  },
  PAY_OVERTIME_CANCEL: {
    textDesc: '由于超时未支付，您的预约配送任务已被取消'
  },
  PAY_SENDER_CANCEL: {
    textDesc: '您已取消预约配送任务'
  },
  GRAB_OVERTIME_CANCEL: {
    textDesc: '很抱歉，由于配送员未接单，您的预约配送任务已取消'
  },
  GRAB_SENDER_CANCEL: {
    textDesc: '您已取消预约配送任务'
  },
  ADMIN_CANCEL: {
    textDesc: '很抱歉，您的预约配送任务已被平台取消，\r\n如有疑问请联系客服'
  },
  PICK_RIDER_CANCEL: {
    textDesc: '很抱歉，由于配送员个人原因，您的预约配送任务已被取消'
  },
  PICK_SENDER_CANCEL: {
    textDesc: '您已取消预约配送任务'
  },
  STORE_CANCEL: {
    textDesc: '门店取消您的预约配送任务，\r\n如有疑问请联系门店'
  }
};
const curStatus = {
  Empty: {
    statusIcon: '',
    statusText: '',
    processImg: '',
    acceptStatusText: '',
    pickStatusText: '',
    finishStatusText: ''
  },
  RECEIVE: {
    statusIcon: 'https://tubobo-qd.oss-cn-shanghai.aliyuncs.com/jipei-wxxcx/express/daijiedan%402x.png',
    statusText: '正在等待配送员接单…',
    processImg: 'https://tubobo-qd.oss-cn-shanghai.aliyuncs.com/jipei-wxxcx/express/jindu0%402x.png',
    acceptStatusText: '',
    pickStatusText: '',
    finishStatusText: ''
  },
  PICKUP: {
    statusIcon: 'https://tubobo-qd.oss-cn-shanghai.aliyuncs.com/jipei-wxxcx/express/daiquhuo%402x.png',
    statusText: '正在等待配送员取货…',
    processImg: 'https://tubobo-qd.oss-cn-shanghai.aliyuncs.com/jipei-wxxcx/express/jindu1%402x.png',
    acceptStatusText: 'showColor',
    pickStatusText: '',
    finishStatusText: ''
  },
  DISTRIBUTION: {
    statusIcon: 'https://tubobo-qd.oss-cn-shanghai.aliyuncs.com/jipei-wxxcx/express/daisonghuo%402x.png',
    statusText: '正在等待配送员送货…',
    processImg: 'https://tubobo-qd.oss-cn-shanghai.aliyuncs.com/jipei-wxxcx/express/jindu2%402x.png',
    acceptStatusText: 'showColor',
    pickStatusText: 'showColor',
    finishStatusText: ''
  },
  FINISH: {
    statusIcon: 'https://tubobo-qd.oss-cn-shanghai.aliyuncs.com/jipei-wxxcx/express/yiqianshou%402x.png',
    statusText: '已签收',
    processImg: 'https://tubobo-qd.oss-cn-shanghai.aliyuncs.com/jipei-wxxcx/express/jindu3%402x.png',
    acceptStatusText: 'showColor',
    pickStatusText: 'showColor',
    finishStatusText: 'showColor'
  },
  CANCEL: {
    statusIcon: '',
    statusText: '',
    processImg: '',
    acceptStatusText: '',
    pickStatusText: '',
    finishStatusText: ''
  }
};

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    countTime: '',
    textDesc: '',
    appointStatus: {
      statusIcon: '',
      statusText: '',
      processImg: '',
      acceptStatusText: '',
      pickStatusText: '',
      finishStatusText: ''
    },
    effi: {
      key: 'effi',
      stars: [
        0, 0, 0, 0, 0
      ],
      count: 0,
      notap: true
    },
    atti: {
      key: 'atti',
      stars: [
        0, 0, 0, 0, 0
      ],
      count: 0,
      notap: true
    },
    expressId: '',
    canSubmit: false,
    canAppoint: false,
    resultData: {
      expressInfo: {
        inTime: 0,
        pickupType: '',
        storeName: '',
        waybillNo: '',
        expressCompanyName: '',
        areaNum: '',
        waybillStatus: '',
        dispatchFlag: ''
      },
      evaluationInfo: {
        evalAttitude: '',
        evaluationFlag: true,
        evalComment: '',
        evalEfficiency: ''
      },
      expressList: [{
        time: '',
        expressDesc: ''
      }],
      taskInfo: {
        pickupCode: '',
        receiverName: '',
        distributionStatus: '',
        riderName: '',
        receiverAddress: '',
        cancelTime: 0,
        appointTime: '',
        payFlag: false,
        receiverPhone: '',
        pickTime: '',
        cancelReason: '',
        riderPhone: '',
        acceptTime: '',
        finishTime: '',
        payRemainMillSeconds: 0,
        remark: '',
        totalPrice: '',
        deliveryFee: '',
        bigParcelFee: ''
      }
    }
  },

  onLoad (options) {
    app.ToastPanel();
    const expressId = options.id;
    console.log('options------', options)
    wx.setStorageSync('expressId', expressId);
    this.setData({
      expressId: expressId
    });
    this.getDetailData(() => {
      this.initCountTime();
      this.isShareAppMessage();
    });
  },

  /**
   * 通过expressId向后台获取详情页的数据
   */
  getDetailData (callback) {
    const that = this;
    const {
      expressId
     } = that.data;
    const param = {
      mode: 'express',
      url: 'wxcx/express/receive/detail',
      method: 'POST',
      data: {
        expressId
      },
      success: (result) => {
        if (result.resultCode === '200' || result.resultCode === '0') {
          /**
           * 处理后台传过来distributionStatus和cancelReason为空情况
          */
          // 这块需要在仔细细化下，取出来的进行数据处理

          if (result.resultData.taskInfo.distributionStatus === '') {
            result.resultData.taskInfo.distributionStatus = 'Empty';
          }
          if (result.resultData.taskInfo.cancelReason === '') {
            result.resultData.taskInfo.cancelReason = 'Empty';
          }

          if (result.resultData.taskInfo.acceptTime > 0) {
            result.resultData.taskInfo.acceptTime = formatDate(result.resultData.taskInfo.acceptTime, 'HH:mm');
          }
          if (result.resultData.taskInfo.pickTime > 0) {
            result.resultData.taskInfo.pickTime = formatDate(result.resultData.taskInfo.pickTime, 'HH:mm');
          }
          if (result.resultData.taskInfo.finishTime > 0) {
            result.resultData.taskInfo.finishTime = formatDate(result.resultData.taskInfo.finishTime, 'HH:mm');
          }

          if (result.resultData.expressInfo.dispatchFlag) {
            that.setData({
              canAppoint: true,
              canSubmit: true
            });
          }

          const {
            cancelReason,
            distributionStatus
          } = result.resultData.taskInfo;

          /**
           * 处理详情页返回的路由跳转
          */
          if (result.resultData.taskInfo.distributionStatus === 'RECEIVE'
          || result.resultData.taskInfo.distributionStatus === 'PICKUP'
          || result.resultData.taskInfo.distributionStatus === 'DISTRIBUTION') {
            wx.setStorageSync('currentMenuIndex', 1);
          } else if (result.resultData.taskInfo.distributionStatus === 'FINISH'
          || result.resultData.expressInfo.waybillStatus === 3
          || result.resultData.expressInfo.waybillStatus === 5) {
            wx.setStorageSync('currentMenuIndex', 2);
          } else {
            wx.setStorageSync('currentMenuIndex', 0);
          }

          console.log('请求详情页的数据', result.resultData);

          /**
           * 根据订单状态处理订单的取消原因
          */
          const {
            textDesc
          } = curCancel[cancelReason];

          /**
           * 根据订单状态处理订单的头部的物流状态
          */
          const {
            statusIcon,
            statusText,
            processImg,
            acceptStatusText,
            pickStatusText,
            finishStatusText
          } = curStatus[distributionStatus];

          that.setData({resultData: result.resultData}, callback);

          that.setData({
            textDesc: textDesc,
            appointStatus: {
              statusIcon: statusIcon,
              statusText: statusText,
              processImg: processImg,
              acceptStatusText: acceptStatusText,
              pickStatusText: pickStatusText,
              finishStatusText: finishStatusText
            }
          });

          /**
           * 处理时间戳转日期问题
          */

          const resultData = {...result.resultData};
          resultData.expressList.forEach((item) => {
            const dayTime = formatDate(item.time, 'yyyy-MM-dd HH:mm:ss');
            item.time = dayTime;
            return item;
          });
          that.setData({ resultData });
          /**
           * 把门店信息存储到本地以方便预约配送页面获取快递门店信息
          */
          const {
            storeName,
            waybillNo,
            expressCompanyName
          } = result.resultData.expressInfo;
          wx.setStorageSync('storeName', storeName);
          wx.setStorageSync('waybillNo', waybillNo);
          wx.setStorageSync('expressCompanyName', expressCompanyName);

          /**
          * 处理评价星星数
          */
          const {
            evalEfficiency,
            evalAttitude
          } = result.resultData.evaluationInfo;

          const {
            effi,
            atti
          } = this.data;

          for (var i = 0; i < +evalEfficiency; i++) {
            effi.stars[i] = 1;
          }
          for (var j = 0; j < +evalAttitude; j++) {
            atti.stars[j] = 1;
          }
          this.setData({
            effi,
            atti
          });
        } else {
          that.showToast('网络错误，请重试...');
        }
      },
      fail () {
        that.showToast('网络错误，请重试...');
      }
    };
    doRequestWithRefreshingToken(param);
  },

  /**
   * 初始化计时器
   */
  initCountTime () {
    const {
      payRemainMillSeconds
    } = this.data.resultData.taskInfo;

    let initTime = payRemainMillSeconds;

    // 异常处理，后台返回数据为负数，前端界面展示00：00
    if (initTime > 0) {
      let countMinute = Math.floor(initTime / 1000 / 60);
      let countSec = Math.ceil((initTime - (countMinute * 1000 * 60)) / 1000);
      this.setTime(countMinute, countSec);
      if (countMinute <= 0 && countSec <= 0) {
        return;
      }
      this.countTimer = setInterval(() => {
        countSec -= 1;
        if (countSec === 0) {
          this.setTime(countMinute, countSec);
        } else if (countSec < 0) {
          if (countMinute <= 0) {
            // 结束计时
            clearInterval(this.countTimer);
            this.countTimer = null;
            this.onPullDownRefresh();
          } else {
            countSec = 59;
            countMinute -= 1;
            this.setTime(countMinute, countSec);
          }
        } else {
          this.setTime(countMinute, countSec);
        }
      }, 1000);
    } else {
      this.setTime(0, 0);
    }
  },

  /**
   * 设置计时器的展示
   */
  setTime (countMinute, countSec) {
    if ((`${countMinute}`).length < 2) {
      countMinute = `0${countMinute}`;
    }
    if ((`${countSec}`).length < 2) {
      countSec = `0${countSec}`;
    }
    this.setData({
      countTime: `${countMinute}:${countSec}`
    });
  },

  /**
   * 给客服打电话
   */
  makePhoneCall () {
    wx.makePhoneCall({
      phoneNumber: '4006006700',
      success: (res) => {
        console.log('拨打电话成功！');
      },
      fail: (res) => {
        console.log('拨打电话失败！');
      }
    });
  },

  /**
   * 给骑手打电话
   */
  makeRideCall () {
    wx.makePhoneCall({
      phoneNumber: this.data.resultData.taskInfo.riderPhone,
      success: (res) => {
        console.log('拨打电话成功！');
      },
      fail: (res) => {
        console.log('拨打电话失败！');
      }
    });
  },

  /**
   * 预约配送弹框
   */
  showModal () {
    const that = this;
    const {
      expressId,
      canAppoint
    } = this.data;

    if (canAppoint) {
      console.log('进了啊啊啊啊啊啊啊啊啊啊');
      wx.showModal({
        title: '',
        content: '预约配送将有快递小哥送货上门并收取一定的配送费哦',
        cancelColor: '#666666',
        confirmColor: '#333333',
        success: (res) => {
          if (res.confirm) {
            wx.removeStorageSync('multiIndex');
            wx.removeStorageSync('remark');
            wx.redirectTo({
              url: `../expressAppoint/expressAppoint?id=${expressId}`
            });
            console.log('用户点击确定');
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
    } else {
      console.log('这儿了啊啊啊啊啊啊啊啊啊啊');
      that.showToast('门店未开启预约配送');
    }
  },

  /**
   * 调取消弹框，取消订单
   */
  showCancel () {
    const that = this;
    wx.showModal({
      title: '',
      content: '取消订单后您可通过自提码\r\n前往门店取件',
      cancelColor: '#666666',
      confirmColor: '#333333',
      success: (res) => {
        if (res.confirm) {
          that.doCancel();
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
  },

  /**
   * 取消订单
   */
  doCancel () {
    const that = this;
    const {
      expressId
     } = that.data;
    const params = {
      mode: 'express',
      url: 'wxcx/express/cancel',
      method: 'POST',
      data: {
        expressId
      },
      success: (result) => {
        if (result.resultCode === '200' || result.resultCode === '0') {
          wx.setStorageSync('currentMenuIndex', 0);
          wx.switchTab({
            url: '/pages/expressReceiveList/expressReceiveList'
          });
        } else {
          that.showToast(result.resultDesc);
          that.onPullDownRefresh();
        };
      },
      fail () {
        that.showToast('网络错误，请重试...');
      }
    };
    doRequestWithRefreshingToken(params);
  },

  /**
   * 进入评价详情页
   */
  showEvaluate () {
    const {
      expressId
    } = this.data;

    wx.redirectTo({
      url: `../expressEvaluateDetail/expressEvaluateDetail?id=${expressId}`
    });
  },

  /**
   * 支付接口 需要快递的Id和客户端的IP
   */

  doPay () {
    console.log('调用支付功能');
    const that = this;
    // FIX ME: 临时增加参数openId，周一确认
    // const openId = wx.getStorageSync('openId');
    const {
      expressId,
      canSubmit
     } = that.data;

    const {
    dispatchFlag
    } = that.data.resultData.expressInfo;

    if (!dispatchFlag) {
      that.setData({
        canSubmit: false
      });
      that.showToast('门店已关闭预约配送功能，目前不能下单');
    } else {
      Util.throttle(() => {
        const params = {
          mode: 'express',
          url: 'wxcx/express/pay',
          method: 'POST',
          data: {
            expressId,
            // openId,
            clientIp: '127.0.0.1'
          },
          success: (result) => {
            that.setData({
              canSubmit: true
            });
            if (result.resultCode === '200' || result.resultCode === '0') {
              that.commitNormalBuySuccessFn(result.resultData.extend);
            } else {
              that.showToast('订单生成有误，请稍后重试...');
            }
          },
          fail () {
            that.showToast('网络错误，请重试...');
          }
        };
        if (canSubmit === true) {
          doRequestWithRefreshingToken(params);
          that.setData({
            canSubmit: false
          });
        }
      }, that, 300);
    }
  },

  /**
   * 用服务端的参数，调小程序支付接口
   */
  commitNormalBuySuccessFn (extend = {}) {
    const {
      timeStamp,
      nonceStr,
      pack,
      signType = 'MD5',
      paySign
    } = extend;
    const that = this;
    wx.requestPayment({
      timeStamp: '' + timeStamp,
      nonceStr,
      'package': pack,
      signType,
      paySign,
      'success': function (res) {
        that.paySuccess();
      },
      'fail': function (res) {
        // 异常处理
        console.log('支付失败', res);
        that.showToast('支付失败');
        // that.onPullDownRefresh();
      }
    });
  },

  // 微信支付成功回调，告诉后端
  paySuccess () {
    const that = this;
    const {
      expressId
     } = this.data;
    const param = {
      mode: 'express',
      url: 'wxcx/query/pay/info',
      method: 'POST',
      data: {
        expressId
      },
      success: (result) => {
        if (result.resultCode === '200' || result.resultCode === '0') {
          that.onPullDownRefresh();
        } else {
          that.showToast('支付出现异常，请稍后重试...');
        }
      },
      fail () {
        that.showToast('网络错误，请重试...');
      }
    };
    doRequestWithRefreshingToken(param);
  },

  /**
   * 当处理完数据刷新后,停止当前页面的下拉刷新。
   */
  onPullDownRefresh () {
    this.getDetailData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 判断详情页是否能分享朋友圈
  */
  isShareAppMessage () {
    const {
      pickupType,
      waybillStatus,
      payFlag
    } = this.data.resultData.expressInfo;

    if (pickupType === 'SELF' && payFlag === '0' && waybillStatus === 1) {
      this.onShareAppMessage();
    } else {
      wx.hideShareMenu();
    }
  },

  /**
   * 分享给朋友
  */
  onShareAppMessage () {
    const {
      storeName,
      waybillNo,
      expressCompanyName,
      areaNum
    } = this.data.resultData.expressInfo;

    return {
      title: '我在兔波波门店有个自提件，正找您代拿，去看看吧～',
      desc: '请打开链接查看自提码~',
      path: `/pages/selfNotification/selfNotification?key=${storeName}&key2=${waybillNo}&key3=${expressCompanyName}&key4=${areaNum}`,
      success: () => {},
      cancel: () => {}
    };
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    // TODO: onReady
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
    // TODO: onHide
  },

  /**
   * 生命周期函数--监听页面卸载时，清除定时器
   */
  onUnload () {
    clearInterval(this.countTimer);
  }

});

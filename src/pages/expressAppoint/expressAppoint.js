import { doRequestWithRefreshingToken } from '../../utils/RequestUtil.js';
import { isEmptyObject } from '../../utils/util.js';
const Util = require('../../utils/util');
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    addressId: '',
    storeName: '',
    waybillNo: '',
    expressCompanyName: '',
    totalPrice: '0.00',
    remark: '',
    receiveAddr: {},
    deliveryRange: true,
    rulesInfo: {},
    multiArray: [['立即送达', '今天', '明天', '后天'], ['30分钟内']],
    multiArrayTime: [
      '立即送达',
      new Date().getMonth() + 1 + '月' + new Date().getDate() + '日',
      new Date().getMonth() + 1 + '月' + (new Date().getDate() + 1) + '日',
      new Date().getMonth() + 1 + '月' + (new Date().getDate() + 2) + '日'
    ],
    multiArraylist: [],
    multiIndex: [0, 0],
    canSubmit: false,
    isEmptyAddr: true
  },

  /**
   * 监听页面加载
   */
  onLoad (options) {
    app.ToastPanel();
    const expressId = options.id;
    wx.setStorageSync('expressId', expressId);
    this.setData({
      expressId: expressId
    });
    // 从本地取快递信息
    const storeName = wx.getStorageSync('storeName');
    const waybillNo = wx.getStorageSync('waybillNo');
    const expressCompanyName = wx.getStorageSync('expressCompanyName');
    const remark = wx.getStorageSync('remark');
    const multiIndex = wx.getStorageSync('multiIndex');

    // 向后台请求详情页数据，获取快递的基本信息（发送请求）
    this.setData({
      storeName,
      waybillNo,
      expressCompanyName,
      remark: remark,
      multiIndex: multiIndex || [0, 0],
      multiArraylist: this.getTypeList()
    });
    this.getAppointTime(multiIndex[0]);
  /**
   * 通过在本地Storage中获取addressId
   */
    const addressId = wx.getStorageSync('addressId');
    this.setData({
      addressId: addressId
    });
    if (this.data.addressId) {
      this.handleAddrAjax();
    }
  },

  /**
   * 预约配送时间
   */
  bindMultiPickerChange (e) {
    const that = this;
    const {
      longitude,
      latitude
    } = that.data.receiveAddr;

    // 获取当前的预约时间和预约类型
    that.setData({
      multiIndex: e.detail.value,
      appointType: that.getAppointType()
    }, () => {
      if (longitude && latitude) {
        that.updateTotalPrice();
      }
    });
    wx.setStorageSync('multiIndex', this.data.multiIndex);
  },

  bindMultiPickerColumnChange (e) {
    const {
      multiIndex
    } = this.data;
    multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        this.getAppointTime(multiIndex[0]);
        break;
    }
    this.setData({
      multiIndex
    });
  },

  getAppointTime (day) {
    const {
      multiArray,
      multiArraylist
    } = this.data;
    switch (multiArray[0][day]) {
      case '立即送达':
        multiArray[1] = ['30分钟内'];
        break;
      case '今天':
        multiArray[1] = multiArraylist[0];
        break;
      case '明天':
        multiArray[1] = ['10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];
        break;
      case '后天':
        multiArray[1] = ['10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];
        break;
    }
    this.setData({
      multiArray,
      multiArraylist
    });
  },

  /**
   * 获取弹框的预约时间值
   */
  getAppointType () {
    const that = this;
    const {
      multiArray,
      multiIndex
    } = that.data;
    let appoint;
    switch (multiArray[0][multiIndex[0]]) {
      case '立即送达':
        appoint = '0';
        break;
      case '今天':
        appoint = '1';
        break;
      case '明天':
        appoint = '2';
        break;
      case '后天':
        appoint = '3';
        break;
      default:
        break;
    }
    return appoint;
  },

  /**
   * 根据当前时间更新弹框的时间列表
   */
  getTypeList () {
    // 获取当前时间
    const hour = new Date().getHours();
    const {
      multiArraylist
    } = this.data;

    if (this && hour < 10) {
      multiArraylist.push('10:00—12:00');
    }
    if (hour < 12) {
      multiArraylist.push('12:00—14:00');
    }
    if (hour < 14) {
      multiArraylist.push('14:00—16:00');
    }
    if (hour < 16) {
      multiArraylist.push('16:00—18:00');
    }
    if (hour >= 16 && hour < 18) {
      const multiArray = [['立即送达', '明天', '后天'], ['30分钟内']];
      const multiArrayTime = [
        '立即送达',
        new Date().getMonth() + 1 + '月' + (new Date().getDate() + 1) + '日',
        new Date().getMonth() + 1 + '月' + (new Date().getDate() + 2) + '日'
      ];
      this.setData({
        multiArray: multiArray,
        multiArrayTime: multiArrayTime
      });
    }
    if (hour >= 18) {
      const multiArray = [['明天', '后天'], ['10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00']];
      const multiArrayTime = [
        new Date().getMonth() + 1 + '月' + (new Date().getDate() + 1) + '日',
        new Date().getMonth() + 1 + '月' + (new Date().getDate() + 2) + '日'
      ];
      this.setData({
        multiArray: multiArray,
        multiArrayTime: multiArrayTime
      });
    }
    return [multiArraylist];
  },

  /**
   * 选择地址列表
   */
  selectAddress () {
    wx.redirectTo({
      url: '../myAddressList/myAddressList'
    });
  },

  /**
   * 编辑地址
   */
  editAddress () {
    const {
      addressId
    } = this.data;
    wx.setStorageSync('addressId', addressId);
    // 1. 把地址信息写缓存
    // 2. 页面跳转
    wx.navigateTo({
      url: '../addMyAddress/addMyAddress?mode=edit'
    });
  },

  /**
   * 通过addressId发请求获取地址信息
   */
  handleAddrAjax () {
    const that = this;
    const {
      addressId
    } = this.data;
    const params = {
      mode: 'addr',
      url: 'common/address/detail',
      method: 'POST',
      data: {
        id: addressId
      },
      success: (result) => {
        if (result.resultCode === '200' || result.resultCode === '0') {
          const {
            detailAddress,
            latitude,
            longitude,
            name,
            city,
            district,
            roomNo,
            street,
            phone,
            province
          } = result.resultData;

          const addressForm = Object.assign(result.resultData, {id: addressId});
          that.saveAddressToStorge(addressForm);

          that.setData({
            receiveAddr: {
              detailAddress: province + city + district + street + detailAddress + roomNo,
              latitude,
              longitude,
              name,
              phone
            }
          }, () => {
            if (!isEmptyObject(this.data.receiveAddr)) {
              that.setData({
                isEmptyAddr: false
              });
            }
            that.judgeDeliveryRange();
          });
        } else {
          that.showToast('获取服务器地址失败，请稍后再试');
        }
      }
    };
    doRequestWithRefreshingToken(params);
  },

  // 存地址
  saveAddressToStorge (data) {
    wx.setStorage({
      key: 'addressForm',
      data: data
    });
  },

   /**
   * 判断配送地址是否在门店内
   */
  judgeDeliveryRange () {
    const that = this;
    const expressId = wx.getStorageSync('expressId');
    const {
      addressId
    } = that.data;

    const params = {
      mode: 'express',
      url: 'wxcx/express/deliveryRange',
      method: 'POST',
      data: {
        expressId: expressId,
        addressId
      },
      success: (result) => {
        if (result.resultCode === '200' || result.resultCode === '0') {
          const {
            deliveryRange
          } = result.resultData;
          if (deliveryRange) {
            that.setData({
              deliveryRange
            }, () => {
              that.updateTotalPrice();
              that.validateSumbitButton();
            });
          } else {
            that.setData({
              deliveryRange
            }, () => {
              wx.showModal({
                title: '',
                content: '您的收货地不在配送范围内哦',
                showCancel: false,
                confirmText: '知道了',
                confirmColor: '#333333'
              });
            });
          }
        }
      }
    };
    doRequestWithRefreshingToken(params);
  },

  /**
   * 获取备注的值
   */
  getRemarkValue (e) {
    const remarkValue = e.detail.value;
    this.setData({
      remark: remarkValue
    });
    wx.setStorageSync('remark', this.data.remark);
  },

  /**
   * 获取总的计价费用
   */
  updateTotalPrice () {
    const that = this;
    const expressId = wx.getStorageSync('expressId');
    const {
      longitude,
      latitude
    } = that.data.receiveAddr;
    const params = {
      mode: 'express',
      url: 'wxcx/express/price',
      method: 'POST',
      data: {
        longitude,
        latitude,
        appointType: that.getAppointType(),
        expressId: expressId
      },
      success: (result) => {
        if (result.resultCode === '200' || result.resultCode === '0') {
          const {
            totalPrice
          } = result.resultData;
          that.setData({
            totalPrice
          });
        } else {
          that.showToast('获取价格失败，请稍后再试');
        }
      }
    };
    doRequestWithRefreshingToken(params);
  },

   /**
   * 获取计价规则(需要做个判断计价规则是否配置)
   */
  getRules () {
    const that = this;
    const {
      longitude,
      latitude
    } = that.data.receiveAddr;
    const params = {
      mode: 'express',
      url: 'wxcx/express/rules',
      method: 'POST',
      data: {
        longitude,
        latitude
      },
      success: (result) => {
        if (result.resultCode === '200' || result.resultCode === '0') {
          const {
            immediateDelivery,
            appointment,
            largeParcelDelivery,
            overDayFee
          } = result.resultData;

          wx.showModal({
            title: '预约配送计价规则',
            content: `30分钟内立即送达,配送费${immediateDelivery}元;\r\n预约今天及明天,配送费${appointment}元;\r\n预约第三天配送,配送费${overDayFee}元;\r\n大件包裹加收${largeParcelDelivery}元。`,
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#333333'
          });
        } else {
          that.showToast('获取计价规则失败，请稍后再试');
        }
      }
    };
    doRequestWithRefreshingToken(params);
  },

  // /**
  //  * 显示自定义模态框
  //  */
  // showModal (event) {
  //   this.setData({
  //     modalVisible: true
  //   });
  // },
  // /**
  //  * 隐藏自定义模态框
  //  */
  // hideModal () {
  //   this.setData({
  //     modalVisible: false
  //   });
  // },

  /**
   * 弹框（有时间写自己自定义的弹框）
   */
  showModal () {
    const that = this;
    const {
      longitude,
      latitude
    } = that.data.receiveAddr;

    if (longitude && latitude) {
      that.getRules();
    } else {
      that.showToast('请填写收货地址,再查看计价规则');
    }
  },

  /**
   * 校验按钮是否能提交
   */
  validateSumbitButton () {
    const that = this;
    const {
      receiveAddr,
      deliveryRange
    } = that.data;

    if (!isEmptyObject(receiveAddr) && deliveryRange) {
      that.setData({
        canSubmit: true
      });
    }
  },

  /**
   * 向后台发请求
   */
  doSumbit () {
    const that = this;
    const {
      multiArray,
      multiIndex,
      addressId,
      remark,
      totalPrice
    } = that.data;
    const expressId = wx.getStorageSync('expressId');
    const params = {
      mode: 'express',
      url: 'wxcx/express/appoint',
      method: 'POST',
      data: {
        appointTime: multiArray[1][multiIndex[1]],
        addressId,
        remark,
        totalPrice,
        appointType: that.getAppointType(),
        expressId: expressId
      },
      success: (result) => {
        if (result.resultCode === '200' || result.resultCode === '0') {
          wx.removeStorageSync('remark');
          wx.removeStorageSync('multiIndex');
          wx.removeStorageSync('addressId');
          wx.redirectTo({
            url: `../expressReceiveDetail/expressReceiveDetail?id=${expressId}`
          });
        } else {
          if (result.resultCode === '10025') {
            that.showToast('门店未开启预约配送功能');
          } else {
            that.showToast('任务订单已存在，请勿重复下单');
          }
        }
      }
    };
    doRequestWithRefreshingToken(params);
  },

  /**
   * 提交校验
   */
  sumbit () {
    const that = this;
    const {
      receiveAddr,
      deliveryRange
    } = that.data;
    if (isEmptyObject(receiveAddr)) {
      that.showToast('请填写收货地址');
    } else if (!deliveryRange) {
      that.showToast('您的地址超出配送范围');
    } else {
      Util.throttle(() => {
        that.doSumbit();
      }, that, 300);
    }
  },

  /**
   * 生命周期函数--监听页面卸载时，清除定时器
   */
  onUnload () {
    wx.removeStorageSync('addressId');
  }

});
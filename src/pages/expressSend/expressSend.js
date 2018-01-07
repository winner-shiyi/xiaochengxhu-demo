import { doRequestWithRefreshingToken } from '../../utils/RequestUtil';
import { isEmptyObject, throttle, setDate } from '../../utils/util';

// 获取全局应用程序实例对象
const app = getApp();

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    categoryTypeArr: [ // tab切换标题
      { name: '去门店寄件' },
      { name: '快递员上门' },
    ],
    currentMenuIndex: 0,
    hasStore: true, // 3km内是否有门店
    emptySendAddr: true, // 发货地址是否有值
    emptyReceiveAddr: true, // 收货地址是否有值
    emptyWeight: true, // 物品重量是否有值
    storeIds: [], // 保存所有门店的id
    storeArray: [], // 所有门店名称
    storeIndex: 0,
    multiIndex: [0, 0],
    multiArray: [['今天', '明天', '后天']],
    multiArraylist: [],
    multiArrayTime: [
      setDate(new Date(), 0),
      setDate(new Date(), 1),
      setDate(new Date(), 2),
    ],
    goodsTypeArray: [],
    goodsTypeIndex: 0,
    sendAddr: {}, // 发货地址信息
    receiveAddr: {}, // 收货地址信息
    weight: null, // 物品重量
    remark: '', // 备注信息
    totalVaule: '',
    canSubmit: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    app.ToastPanel();
    this.setData({
      multiArraylist: this.getUsableTime(),
    }, () => {
      this.getAppointTime(this.data.multiIndex[0]);
    });
    wx.setStorageSync('EScurrentMenuIndex', 0);
    this.getLocation();
    this.getDefaultAddress();
    this.getStdmodeData();
  },
  /**
   * 模拟tab切换
   */
  changeTab (event) {
    const { index } = event.currentTarget.dataset;
    const currentMenuIndex = wx.getStorageSync('EScurrentMenuIndex');

    if (index !== currentMenuIndex) {
      wx.setStorageSync('EScurrentMenuIndex', index);
      this.setData({
        currentMenuIndex: index,
      }, () => {
        this.getLocation();
      });
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    const sendAddressObj = wx.getStorageSync('sendAddressData');
    const receiveAddressObj = wx.getStorageSync('receiveAddressData');
    this.getLocation();

    if (!sendAddressObj || isEmptyObject(sendAddressObj)) {
      // 从后台请求默认发货地址
      this.getDefaultAddress();
    } else {
      // 从缓存读，填充发货地址
      const {
        id,
        detailAddress,
        latitude,
        longitude,
        name,
        pcdCode,
        city,
        district,
        roomNo,
        street,
        phone,
        province,
      } = sendAddressObj;
      this.setData({
        sendAddr: {
          id,
          detailAddress: province + city + district + street + detailAddress + roomNo,
          latitude,
          longitude,
          name,
          pcdCode,
          phone,
        },
        emptySendAddr: false,
      });
    }
    // 从缓存读取收货地址
    if (receiveAddressObj && !isEmptyObject(receiveAddressObj)) {
      const {
        id,
        pcdCode,
        detailAddress,
        latitude,
        longitude,
        name,
        city,
        district,
        roomNo,
        street,
        phone,
        province,
      } = receiveAddressObj;
      this.setData({
        receiveAddr: {
          id,
          detailAddress: province + city + district + street + detailAddress + roomNo,
          latitude,
          longitude,
          name,
          pcdCode,
          phone,
        },
        emptyReceiveAddr: false,
      });
    }
    this.validateSumbitButton();
  },
  /**
   * 获取用户地理位置，返回经纬度信息给服务器确认3km内是否有门店
   */
  getLocation () {
    const that = this;
    wx.getLocation({
      success: (res) => {
        const { latitude, longitude } = res;
        that.getSotreData(longitude, latitude);
      },
      fail: () => {
        wx.showModal({
          title: '微信授权',
          content: '为了让您获得更好的体验，需要获取您的地理位置',
          confirmText: '前往授权',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              // 引导用户打开定位权限，且用户确定要打开
              wx.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting['scope.userLocation']) {
                    wx.getLocation({
                      success: (locationRes) => {
                        const { latitude, longitude } = locationRes;
                        that.getSotreData(longitude, latitude);
                      },
                    });
                  } else {
                    // 停留在原页面，不做处理
                  }
                },
              });
            }
          },
        });
      },
    });
  },

  /**
   * 获取门店信息
   */
  getSotreData (longitude, latitude) {
    const that = this;
    doRequestWithRefreshingToken({
      // mode: 'express',
      // url: 'wxcx/express/send/nearStore',
      isAbsolute: true,
      absUrl: 'http://172.16.2.71:8068/mockjsdata/24/wxcx/express/send/nearStore',
      data: {
        longitude,
        latitude,
      },
      success: (result) => {
        if (result.resultCode === '0') {
          const { hasStore, list } = result.resultData;
          if (hasStore) {
            that.setData({
              hasStore,
              storeArray: list.map((item) => `${item.storeName  }${item.storeDistance}`),
              storeIds: list.map((item) => item.storeId),
            });
          } else {
            that.setData({
              hasStore,
              storeArray: [],
              storeIds: [],
            });
          }
        }
      },
      fail: () => {

      },
    });
  },
  /**
   * 获取默认发货地址信息（onshow 也要调用）
   */
  getDefaultAddress () {
    const that = this;
    doRequestWithRefreshingToken({
      // mode: 'addr',
      // url: 'common/address/detail',
      isAbsolute: true,
      absUrl: 'http://172.16.2.71:8068/mockjsdata/24/common/address/detail',
      success: (result) => {
        if (result.resultCode === '0') {
          const {
            id,
            detailAddress,
            latitude,
            longitude,
            name,
            pcdCode,
            city,
            district,
            roomNo,
            street,
            phone,
            province,
          } = result.resultData;

          that.setData({
            sendAddr: {
              id,
              detailAddress: province + city + district + street + detailAddress + roomNo,
              latitude,
              longitude,
              name,
              pcdCode,
              phone,
            },
          }, () => {
            if (!isEmptyObject(that.data.sendAddr)) {
              that.setData({
                emptySendAddr: false,
              });
            }
          });
        } else {
          that.showToast('获取服务器地址失败，请稍后再试');
        }
      },
    });
  },
  /**
   * 获取物品类型信息
   */
  getStdmodeData () {
    const that = this;
    doRequestWithRefreshingToken({
      // mode: 'express',
      // url: 'dictionary/query',
      isAbsolute: true,
      absUrl: 'http://172.16.2.71:8068/mockjsdata/24/dictionary/query',
      data: {
        type: 'shipment',
      },
      success: (result) => {
        if (result.resultCode === '0') {
          const { list } = result.resultData;
          // goodsTypeArray: ['电子设备', '生活用品', '珍贵物品']
          that.setData({
            goodsTypeArray: list.map((item) => item.label),
          });
        }
      },
      fail: () => {

      },
    });
  },
  /**
   * 选择门店
   * @param {*} e
   */
  storePickerChange (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      storeIndex: e.detail.value,
    });
  },
  /**
   * 选择预约时间
   * @param {*} e
   */
  timePickerChange (e) {
    this.setData({
      multiIndex: e.detail.value,
    });
  },
  timePickerColumnChange (e) {
    const {
      multiIndex,
    } = this.data;
    multiIndex[e.detail.column] = e.detail.value;
    console.log('预约时间e.detail.column---', e.detail.column);
    switch (e.detail.column) {
      case 0:
        this.getAppointTime(multiIndex[0]);
        break;
      default:
    }
    this.setData({
      multiIndex,
    });
  },
  /**
   * 选择物品类型
   * @param {*} e
   */
  goodsTypeChange (e) {
    this.setData({
      goodsTypeIndex: e.detail.value,
    });
  },
  /**
   * 填充预约时间picker数据
   * @param {*} day 当天选择的是哪一天
   */
  getAppointTime (day) {
    const {
      multiArray,
      multiArraylist,
    } = this.data;
    switch (multiArray[0][day]) {
      case '今天':
        multiArray[1] = [...multiArraylist];
        break;
      case '明天':
        multiArray[1] = ['10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];
        break;
      case '后天':
        multiArray[1] = ['10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];
        break;
      default:
        console.log('时间框出错');
    }
    this.setData({
      multiArray,
      multiArraylist,
    });
  },
  /**
   * 计算当前可选择的时间段
   */
  getUsableTime () {
    // 获取当前时间点
    const hour = new Date().getHours();
    const {
      multiArraylist,
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
    if (hour >= 16) {
      const multiArray = [['明天', '后天'], ['10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00']];
      const multiArrayTime = [
        setDate(new Date(), 1),
        setDate(new Date(), 2),
      ];

      this.setData({
        multiArray: multiArray,
        multiArrayTime: multiArrayTime,
      });
    }
    return multiArraylist;
  },
  /**
   * 获取弹框的预约时间类型，是今天、明天、后天中哪种
   */
  getAppointType () {
    const that = this;
    const {
      multiArray,
      multiIndex,
    } = that.data;
    let appointType;
    switch (multiArray[0][multiIndex[0]]) {
      case '今天':
        appointType = '1';
        break;
      case '明天':
        appointType = '2';
        break;
      case '后天':
        appointType = '3';
        break;
      default:
        break;
    }
    return appointType;
  },
  /**
   * 选择发货地址列表
   */
  selectSendAddress () {
    wx.navigateTo({
      url: '../addressbox/addressbox?mode=send',
    });
  },
  /**
   * 编辑发货地址
   */
  editSendAddress () {
    const {
      id,
    } = this.data.sendAddr;
    wx.setStorageSync('sendAddrId', id);
    wx.navigateTo({
      url: `../addressbox/addressbox?sendAddrId=${id}`,
    });
  },
  /**
   * 选择收货地址列表
   */
  selectReceiveAddress () {
    wx.navigateTo({
      url: '../addressbox/addressbox?mode=receive',
    });
  },
  /**
   * 编辑收货地址
   */
  editReceiveAddress () {
    const {
      id,
    } = this.data.sendAddr;
    wx.setStorageSync('receiveAddrId', id);
    wx.navigateTo({
      url: `../addressbox/addressbox?receiveAddrId=${id}`,
    });
  },
  /**
   * 获取物品重量
   * @param {*} e
   */
  weightChange (e) {
    const { value } = e.detail;
    this.setData({
      weight: Number(value),
    });
    if (Number(value) !== 0) {
      this.setData({
        emptyWeight: false,
      });
    } else {
      this.setData({
        emptyWeight: true,
      });
    }
    this.validateSumbitButton();
  },
  /**
   * 输入物品重量，失焦验证
   * @param {*} e
   */
  weightBlur (e) {
    const { value } = e.detail;
    if (Number(value) === 0) {
      this.showToast('请输入有效的重量');
      this.setData({
        emptyWeight: true,
      });
    } else {
      this.setData({
        emptyWeight: false,
        weight: Number(value),
      });
    }
    this.validateSumbitButton();
  },

  /**
   * 获取备注信息
   * @param {*} e
   */
  remarkChange (e) {
    const remarkValue = e.detail.value;
    this.setData({
      remark: remarkValue,
    });
  },

  /**
   * 更新预估价格
   */
  updateTotalPrice () {
    const that = this;
    const { weight, currentMenuIndex } = this.data;
    doRequestWithRefreshingToken({
      // mode: 'express',
      // url: 'wxcx/express/send/assessValue',
      isAbsolute: true,
      absUrl: 'http://172.16.2.71:8068/mockjsdata/24/wxcx/express/send/assessValue',
      data: {
        sendType: currentMenuIndex === 0 ? 'STORE' : 'DOOR',
        weight,
        senderPcdCode: that.data.sendAddr.pcdCode,
        receiverPcdCode: that.data.receiveAddr.pcdCode,
      },
      success: (result) => {
        if (result.resultCode === '0') {
          const {
            totalVaule,
          } = result.resultData;
          that.setData({
            totalVaule,
          });
        } else {
          that.showToast('获取价格失败，请稍后再试');
        }
      },
    });
  },
  /**
   * 校验按钮是否能提交
   */
  validateSumbitButton () {
    const that = this;
    const {
      hasStore,
      emptySendAddr,
      emptyReceiveAddr,
      emptyWeight,
    } = that.data;
    if (hasStore && !emptySendAddr && !emptyReceiveAddr && !emptyWeight) {
      that.setData({
        canSubmit: true,
      }, () => {
        that.updateTotalPrice();
      });
    } else {
      that.setData({
        canSubmit: false,
      });
    }
  },
  /**
   * 发送请求，提交订单
   */
  doSumbit () {
    const that = this;
    const {
      currentMenuIndex,
      storeIds,
      storeIndex,
      sendAddr,
      receiveAddr,
      multiArray,
      multiIndex,
      goodsTypeArray,
      goodsTypeIndex,
      weight,
      remark,
      totalVaule,
    } = that.data;
    doRequestWithRefreshingToken({
      // mode: 'express',
      // url: 'wxcx/express/send/assessValue',
      isAbsolute: true,
      absUrl: 'http://172.16.2.71:8068/mockjsdata/24/wxcx/express/send/appoint',
      data: {
        sendType: currentMenuIndex === 0 ? 'STORE' : 'DOOR',
        storeId: storeIds[storeIndex],
        senderAddressId: sendAddr.id,
        receiverAddressId: receiveAddr.id,
        shipment: goodsTypeArray[goodsTypeIndex],
        weight,
        remark,
        totalVaule,
        appointType: currentMenuIndex === 1 ? that.getAppointType() : '',
        appointTime: currentMenuIndex === 1 ? multiArray[1][multiIndex[1]] : '',
      },
      success: (result) => {
        if (result.resultCode === '0') {
          const { appointTaskId } = result.resultData;
          // 清除缓存
          wx.removeStorageSync('sendAddressData');
          wx.removeStorageSync('sendAddrId');
          wx.removeStorageSync('receiveAddressData');
          wx.removeStorageSync('receiveAddrId');
          // 跳转到订单详情页
          wx.redirectTo({
            url: `../expressReceiveDetail/expressReceiveDetail?id=${appointTaskId}`,
            // url: `../expressSendDetail/expressSendDetail?id=${appointTaskId}`,
          });
        }
      },
    });
  },
  /**
   * 提交校验通过后，最后提交订单
   */
  sumbit () {
    const that = this;
    const {
      hasStore,
      emptySendAddr,
      emptyReceiveAddr,
      emptyWeight,
    } = that.data;
    if (!hasStore) {
      that.showToast('附近无门店，暂不支持寄件服务');
    } else if (emptySendAddr) {
      that.showToast('请填写发货地址');
    } else if (emptyReceiveAddr) {
      that.showToast('请填写收货地址');
    } else if (emptyWeight) {
      that.showToast('请填写物品重量');
    } else {
      throttle(() => {
        that.doSumbit();
      }, that, 300);
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    wx.removeStorageSync('sendAddressData');
    wx.removeStorageSync('sendAddrId');
    wx.removeStorageSync('receiveAddressData');
    wx.removeStorageSync('receiveAddrId');
  },

});

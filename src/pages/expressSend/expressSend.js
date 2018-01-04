import { doRequestWithRefreshingToken } from '../../utils/RequestUtil';
import { isEmptyObject } from '../../utils/util';

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
    judgeObject: {
      hasStore: true, // 3km内是否有门店
      NoDefaultAddrress: false, // 是否有默认发货地址
      emptyAddressInStore: true, // 去门店寄件：收获地址是否有值
      emptyAddressInDoor: true, // 快递员上门：收获地址是否有值
    },
    storeArray: ['兔波波1号店  0.3km', '兔波波2号店  0.3km', '兔波波3号店  0.3km', '兔波波4号店  0.3km'],
    storeIndex: 0,
    multiIndex: [0, 0],
    multiArray: [['今天', '明天', '后天']],
    multiArraylist: [],
    multiArrayTime: [
      `${new Date().getMonth() + 1}月${new Date().getDate()}日`,
      `${new Date().getMonth() + 1}月${new Date().getDate() + 1}日`,
      `${new Date().getMonth() + 1}月${new Date().getDate() + 2}日`,
    ],
    goodsTypeArray: ['电子设备', '生活用品', '珍贵物品'],
    goodsTypeIndex: 0,
    defaultAddr: {
      name: '月月小',
      phone: '15880274595',
      address: '浙江省杭州市上城区近江时代大厦12楼哇哈哈哈或或或',
    },
    sendAddr: {}, // 发货地址信息
    receiveAddr: {}, // 收货地址信息
    canSubmit: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    this.setData({
      multiArraylist: this.getUsableTime(),
    }, () => {
      this.getAppointTime(this.data.multiIndex[0]);
    });
    app.ToastPanel();
    // const { currentMenuIndex } = this.data;
    wx.setStorageSync('EScurrentMenuIndex', 0);
    this.getDefaultAddress();

    // const params = {
    //   pageSize: 10,
    //   pageNo: 1,
    //   status: currentMenuIndex
    // };
    // this.doTokenLoadData(params);
  },
  /**
   * 模拟tab切换
   */
  changeTab (event) {
    const { index } = event.currentTarget.dataset;
    const currentMenuIndex = wx.getStorageSync('EScurrentMenuIndex');

    if (index !== currentMenuIndex) {
      wx.setStorageSync('EScurrentMenuIndex', index);
      // const params = {
      //   pageSize: 10,
      //   pageNo: 1,
      //   status: index
      // };
      // if (!wx.getStorageSync('token')) return;
      // this.canLoadData(params, 'down');
      this.setData({
        currentMenuIndex: index,
      });
    }
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    const sendAddressObj = wx.getStorageSync('sendAddressData');
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
          phone,
        },
      });
    }
    // 从缓存读取收货地址


  },
  /**
   * 加载一进入页面请求数据
   */
  _loadData () {

  },
  /**
   * 获取门店信息
   */
  getSotreData () {
    const that = this;
    doRequestWithRefreshingToken({
      // mode: 'express',
      // url: 'wxcx/express/send/nearStore',
      isAbsolute: true,
      absUrl: 'http://172.16.2.71:8068/mockjsdata/24/wxcx/express/send/nearStore',
      data: {
        longitude: '',
        latitude: '',
      },
      success: (result) => {
        if (result.resultCode === '0') {
          const { hasStore, list } = result.resultData;
          // storeArray: ['兔波波1号店  0.3km', '兔波波2号店  0.3km', '兔波波3号店  0.3km', '兔波波4号店  0.3km']
          // that.setData({
          //   storeArray: storeArray,
          // });
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
              phone,
            },
          }, () => {
            if (!isEmptyObject(that.data.sendAddr)) {
              that.setData({
                emptyAddressInStore: false,
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
          // that.setData({
          //   goodsTypeArray: goodsTypeArray,
          // });
        }
      },
      fail: () => {

      },
    });
  },


  /**
   * 获取用户地理位置，返回经纬度信息给服务器确认3km内是否有门店
   */
  hasStoreFn () {

  },
  storePickerChange (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      storeIndex: e.detail.value,
    });
  },
  /**
   * 预约时间
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
  goodsTypeChange (e) {
    this.setData({
      goodsTypeIndex: e.detail.value,
    });
  },
  getAppointTime (day) {
    const {
      multiArray,
      multiArraylist,
    } = this.data;
    switch (multiArray[0][day]) {
      case '今天':
        // const newArr = [multiArray[0],[...multiArraylist]]
        // multiArray[1] = multiArraylist[0];
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
        `${new Date().getMonth() + 1}月${new Date().getDate() + 1}日`,
        `${new Date().getMonth() + 1}月${new Date().getDate() + 2}日`,
      ];
      this.setData({
        multiArray: multiArray,
        multiArrayTime: multiArrayTime,
      });
    }
    return multiArraylist;
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
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
    // TODO: onHide
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    // TODO: onUnload
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {
    // TODO: onPullDownRefresh
  },
});

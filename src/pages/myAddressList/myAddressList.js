import { doRequestWithRefreshingToken } from './../../utils/RequestUtil.js';
// 获取全局应用程序实例对象
const app = getApp();
Page({
  data: {
    items: [
    ],
    startX: 0, // 开始坐标
    startY: 0
  },
  onLoad: function () {
    app.ToastPanel();

    this.fetchAddrList();
  },
  fetchAddrList: function () {
    const that = this;
    doRequestWithRefreshingToken({
      mode: 'addr',
      url: 'common/address/list',
      data: { poi: true },
      success: (data) => {
        const {resultData, resultCode, resultDesc} = data;
        if (resultCode === '0') {
          that.setData({
            items: resultData,
          });
        } else {
          that.showToast(resultDesc);
          // that.showToast('列表获取错误，请稍后再试');
        }
      }
    });
  },
  findAddrId: function (e) {
    const { index } = e.currentTarget.dataset;
    const { items } = this.data;
    const currentAddressItem = items[index];
    const { id } = currentAddressItem;
    return id;
  },
  handleAddrTap(e) {
    if (typeof e.currentTarget.dataset.index !== 'undefined') {
      // selece address
      const addressId = this.findAddrId(e);
      const expressId = wx.getStorageSync('expressId');
      wx.setStorage({
        key: 'addressId',
        data: addressId,
        success: () => {
          // 成功后跳转回原页面
          // wx.navigateBack();
          wx.redirectTo({
            url: `../expressAppoint/expressAppoint?id=${expressId}`
          });
          // const addressId = wx.getStorageSync('addressId');
          // console.log('addressId', addressId);
        },
      });
    }
  },
  // 手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    // 开始触摸时 重置所有删除
    this.data.items.forEach(function (v, i) {
      if (v.isTouchMove) { // 只操作为true的
        v.isTouchMove = false;
      }
    });

    if (e.changedTouches && e.changedTouches[0]) {
      const { clientX, clientY } = e.changedTouches[0];
      // console.log(e, e.changedTouches[0].clientY)
      this.setData({
        startX: clientX,
        startY: clientY,
        items: this.data.items,
      });
    }
  },
  // 滑动事件处理
  touchmove: function (e) {
    const that = this;
    const { 
      items,
      startX,
      startY,
    } = this.data;
    const index = e.currentTarget.dataset.index; // 当前索引
    const touchMoveX = e.changedTouches[0].clientX; // 滑动变化坐标
    const touchMoveY = e.changedTouches[0].clientY; // 滑动变化坐标
    // 获取滑动角度
    const angle = that.angle({ 
      X: startX, 
      Y: startY,
    }, { 
      X: touchMoveX, 
      Y: touchMoveY,
    });

    items.forEach(function (v, i) {
      // v.isTouchMove = false;
      // 滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i === index) {
        if (touchMoveX > startX) { // 右滑
          v.isTouchMove = false;
        } else { // 左滑
          v.isTouchMove = true;
          // console.log(items[index].isTouchMove)
        }
      } else {
        v.isTouchMove = false;
      }
    });
    
    that.setData({
      items,
    });
  },
  /**
  * 计算滑动角度
  * @param {Object} start 起点坐标
  * @param {Object} end 终点坐标
  */
  angle: function (start, end) {
    const _X = end.X - start.X;
    const _Y = end.Y - start.Y;
    // 返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
   // 删除事件
  del: function (e) {
    let {
      items
    } = this.data;
    const context = this;

    wx.showModal({
      title: '操作提示',
      content: '确认要删除该收货地址？',
      success: function(res) {
        if (res.confirm) {
          // request to delelete list items, and then refresh current state
          // 1. doRequestWithRefreshingToken
          // 2. setData
          const addressId = context.findAddrId(e);
          context.delAddress(addressId);

        } else if (res.cancel) {
          console.log('hideModal')
        }
      }
    });
  },
  delAddress: function (id) {
    const that = this;
    doRequestWithRefreshingToken({
      mode: 'addr',
      url: 'common/address/delete',
      data: { ids: id },
      success: (data) => {
        const {resultData, resultCode, resultDesc} = data;
        if (resultCode === '0') {
          that.showToast('删除成功');
          that.fetchAddrList();
        } else {
          that.showToast(resultDesc);
        }
      }
    });
  },
  addAddress: function () {
    wx.removeStorageSync('addressForm');
    wx.redirectTo({
      url: '../addMyAddress/addMyAddress?mode=add'
    });
  }
});

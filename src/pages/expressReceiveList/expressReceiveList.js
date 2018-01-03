import { doRequestWithRefreshingToken } from '../../utils/RequestUtil.js';

// 获取全局应用程序实例对象
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryTypeArr: [ // tab切换标题
      { name: '待自提' },
      { name: '配送中' },
      { name: '已完成' }
    ],
    statusData: { // 快递订单状态
      RECEIVE: '待接单',
      PICKUP: '待取货',
      DISTRIBUTION: '配送中',
      FINISH: '已完成',
      CANCEL: '已退回'
    },
    currentMenuIndex: 0,
    orderList: [],
    pageNo: 1,
    isShowReload: false, // 是否展示【重新加载】按钮
    isLoadedAll: false, // 没有更多数据
    isConnectOk: false // 网络状态 或者 服务器返回是否正常
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    app.ToastPanel();
    const { currentMenuIndex } = this.data;
    wx.setStorageSync('currentMenuIndex', 0);
    const params = {
      pageSize: 10,
      pageNo: 1,
      status: currentMenuIndex
    };
    this.doTokenLoadData(params);
  },
  onShow () {
    const params = {
      pageSize: 10,
      pageNo: 1,
      status: wx.getStorageSync('currentMenuIndex')
    };
    this.doTokenLoadData(params);
  },
  /**
   * 保证只有拿到token之后才会发起ajax请求
   */
  doTokenLoadData (params) {
    if (wx.getStorageSync('token')) {
      this.canLoadData(params, 'down');
    } else {
      app.tokenReadyCallback = data => {
        // console.log('token---', data.resultData.token);
        if (data.resultData.token) {
          this.canLoadData(params, 'down');
        }
      };
    }
  },
  /**
   * 接口获取列表数据
   * params:object 请求接口参数
   * type:string ['up'表示上拉加载，'down'表示下拉刷新]
   *  callback:function 数据渲染完成后的回调，比如是否停止下拉刷新
   */
  _loadData (params, type, callback = function () {}) {
    doRequestWithRefreshingToken({
      mode: 'express',
      url: 'wxcx/express/receive/list',
      data: {...params},
      success: (data) => {
        const {resultData, resultCode, resultDesc} = data;
        // console.log('不惑的库-快递列表的list---', data);
        if (resultCode === '0') {
          const { totalSize, pageSize, list } = resultData;
          const { pageNo, orderList } = this.data;
          const flag = totalSize <= (pageNo * pageSize);
          let totalList;
          if (type === 'up') {
            totalList = orderList.concat(list);
          } else {
            totalList = list;
          }
          this.setData({
            orderList: totalList,
            isLoadedAll: flag,
            LoadingMore: !flag,
            isConnectOk: true,
            currentMenuIndex: params.status,
            pageNo: params.pageNo
          }, callback);
        } else {
          this.setData({
            isConnectOk: false,
            LoadingMore: false,
            isLoadedAll: false,
            isShowReload: true
          });
          this.showToast(resultDesc);
        }
      },
      fail: () => {
      }
    });
  },
  /**
   * 先判断网络状态后在执行ajax请求
   */
  canLoadData (params, type, callback) {
    const that = this;
    wx.getNetworkType({
      success: function (res) {
        const networkType = res.networkType;
        if (networkType === 'none' || networkType === 'unknown') {
          that.setData({
            isConnectOk: false,
            LoadingMore: false,
            isLoadedAll: false,
            isShowReload: true
          });
          that.showToast('网络错误，请重试');
        } else {
          that.setData({
            isShowReload: false
          });
          that._loadData(params, type, callback);
        }
      }
    });
  },
  /**
   * 模拟tab切换
   */
  changeOrderList (event) {
    const index = event.currentTarget.dataset.index;
    const currentMenuIndex = wx.getStorageSync('currentMenuIndex');

    if (index !== currentMenuIndex) {
      wx.setStorageSync('currentMenuIndex', index);
      const params = {
        pageSize: 10,
        pageNo: 1,
        status: index
      };
      if (!wx.getStorageSync('token')) return;
      this.canLoadData(params, 'down');
    }
  },
  /**
   * 点击【预约配送】，确定后跳转到预约配送页面
   */
  dispatchOrder (event) {
    wx.showModal({
      content: '预约配送将有快递小哥送货上门并收取一定的配送费哦',
      success: function (res) {
        if (res.confirm) {
          const { id, waybillno, storename, expresscompanyname } = event.currentTarget.dataset;
          wx.setStorageSync('waybillNo', waybillno);
          wx.setStorageSync('storeName', storename);
          wx.setStorageSync('expressCompanyName', expresscompanyname);
          // 预约配送页面需要清除这些缓存
          wx.removeStorageSync('remark');
          wx.removeStorageSync('multiIndex');
          wx.navigateTo({
            url: `../expressAppoint/expressAppoint?id=${id}`
          });
        }
      }
    });
  },
  /**
   * 点击置灰的【预约配送】，不做跳转
   */
  noDispatch () {
    wx.showModal({
      content: '该门店暂不支持预约配送哦',
      showCancel: false,
      confirmText: '知道了'
    });
  },
  /**
   * 跳转到订单详情
   */
  onExpressItemTap (event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../expressReceiveDetail/expressReceiveDetail?id=${id}`
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh (event) {
    if (!wx.getStorageSync('token')) return;
    const currentMenuIndex = wx.getStorageSync('currentMenuIndex');
    this.setData({
      pageNo: 1,
      LoadingMore: false,
      isLoadedAll: false
    });
    const params = {
      pageSize: 10,
      pageNo: 1,
      status: currentMenuIndex
    };

    this.canLoadData(params, 'down', () => {
      wx.stopPullDownRefresh();
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {
    if (!wx.getStorageSync('token')) return;
    const { currentMenuIndex } = this.data;
    if (!this.data.isLoadedAll) {
      this.setData({
        pageNo: this.data.pageNo += 1
      });
      const params = {
        pageSize: 10,
        pageNo: this.data.pageNo,
        status: currentMenuIndex
      };
      this.canLoadData(params, 'up');
    }
  }

});

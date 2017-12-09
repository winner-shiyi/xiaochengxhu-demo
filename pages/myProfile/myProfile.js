import promiseAjax from '../../utils/PromiseAjax.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalVisible: false,
    userInfoData: {},
    userName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadData();
  },

  _loadData: function () {
    const params = {};
    promiseAjax.post('wx/tuboboUser/userInfo', params).then((data) => {
      console.log('data----', data);

      this.setData({
        userInfoData: data.resultData,
        userName: data.resultData.nickName,
        loadingHidden: true,
      });
      // callback && callback();
    }).catch((err) => {
      console.log('请求出错啦3333');

    });
  },
  /**
   * 显示之定义模态框
   */
  showModal: function (event) {
    this.setData({
      modalVisible: true,
    });


  },
  hideModal: function () {
    this.setData({
      modalVisible: false,
    });
  },
  /**
   * 修改姓名
   */
  onEditName: function () {
    
  },
  preventTouchMove: function () {
    console.log(111);
  },
  /**
   * 实时输入
   */
  changeName: function (event) {

    let newName = event.detail.value;
    this.setData({
      userName: newName,
    });
    console.log(event.detail);
  },
  /**
   * 查看优惠券
   */
  onCouponTap: function () {
    // 浩南toast
    wx.showModal({
      title: '暂不支持',
      content: '',
    })
  },
  /**
   * 提交修改后的昵称
   */
  bindFormSubmit: function (event) {
    // 发送保存接口，然后关闭弹窗todo
    console.log("e.detail.value.textarea----", event.detail.value.textarea);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
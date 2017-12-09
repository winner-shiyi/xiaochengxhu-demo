import promiseAjax from '../../utils/PromiseAjax.js';
import { utilTrim } from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalVisible: false,
    userInfoData: {},
    userName: '',
    canSubmit: true,
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
      canSubmit: true,
    });
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
    if (!newName.length) {
      this.setData({
        canSubmit: false,
      });
    } else {
      this.setData({
        canSubmit: true,
      });
    }
    console.log("event.detail---", );
  },
  
  /**
   * 提交修改后的昵称
   */
  bindFormSubmit: function (event) {
    const newName = event.detail.value.textarea;
    const params = {
      nickName: utilTrim(newName),
    };
    if (!utilTrim(newName)) {
      this.setData({
        canSubmit: false,
      });
      // 浩南toat提示
      wx.showModal({
        title: '修改失败，请输入昵称',
        content: '',
      });

    } else {
      console.log('params----', params);
      promiseAjax.post('wx/tuboboUser/updateNickName', params).then((data) => {
        console.log('data----', data);

        this.setData({
          modalVisible: false,
        });
        this._loadData();

      }).catch((err) => {
        console.log('请求出错啦3333');

      });
    }
    
    
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
})
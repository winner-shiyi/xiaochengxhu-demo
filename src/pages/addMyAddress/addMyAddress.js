import { doRequestWithRefreshingToken } from './../../utils/RequestUtil.js';
// 获取全局应用程序实例对象
const app = getApp();
const { validateByRule } = app.infoValidator;
// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mode: 'add',
    canSave: false,
    errMsg: '',
    form: {
      id: '',
      detailAddress: '',
      latitude: '',
      phone: '',
      city: '',
      pcdCode: '',
      name: '',
      street: '',
      province: '',
      roomNo: '',
      longitude: '',
      isDefault: false,
      district: '',
    },
  },

  onLoad: function(options) {    
    this.setData({    
      mode: options.mode || 'add',    
    });   
    app.ToastPanel();
  }, 

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    // TODO: onReady
    
    // 1. check if storage has history addressId, yes for modification and no for add new address
    this.getAddressForm();
  },

  getAddressForm () {
    const context = this;

    wx.getStorage({
      key: 'addressForm',
      success: ({ data }) => {
        context.setData({
          form: data,
        }, context.resetSubmitButton);
      },
      fail: () => {
        // add new address
      },
    });
  },

  changeName (e) {
    this.changeFormItem('name', e.detail.value);
  },

  clearName () {
    this.clearFormItem('name');
  },

  changePhone (e) {
    this.changeFormItem('phone', e.detail.value);
  },

  clearPhone () {
    this.clearFormItem('phone');
  },

  changeRoomNo (e) {
    this.changeFormItem('roomNo', e.detail.value);
  },

  clearRoomNo () {
    this.clearFormItem('roomNo');
  },

  changeFormItem (key, value) {
    let newForm = Object.assign({}, this.data.form);
    newForm[key] = value;
    this.setForm(newForm);
  },
  clearFormItem (key) {
    this.changeFormItem(key, '');
  },
  setForm (form) {
    this.setData({
      form,
    }, this.resetSubmitButton);
  },

  searchAddress () {
    const {
      form,
      mode,
    } = this.data;
    wx.setStorage({
      key: 'addressForm',
      data: form,
      success() {
        wx.redirectTo({
          url: `../searchPoiAddress/searchPoiAddress?mode=${mode}`,
        });
      },
      fail() {
        // console.log('fail to call setStorage api in searchAddress');
      },
      complete() {
        // console.log('complete to call setStorage api in searchAddress');
      },
    });
    // console.log('searchAddress');
  },

  validate () {
    const itemsList = ['name', 'phone', 'detailAddress', 'roomNo'];
    const rules = {
      name: { type: 'notNull', errorMessage: '请输入用户名' },
      phone: { type: 'isMobile', errorMessage: '请输入正确的手机号' },
      detailAddress: { type: 'notNull', errorMessage: '请选择收获地址' },
      roomNo: { type: 'notNull', errorMessage: '请输入详细地址' },
    };
    let canSave = true;
    let errMsg = '';
    itemsList.map(item => {
      if (canSave) {
        const result = validateByRule(
          Object.assign(rules[item], { data: { currentValue: this.data.form[item] } })
        );
        canSave = result.success;
        errMsg = result.message;
      }
    });
    return {canSave, errMsg};
  },

  resetSubmitButton () {
    this.setData(this.validate());
  },

  try2Submit () {
    if (this.validate().canSave) {
      // 再次校验通过后，进行最后的提交
      this.doSubmit();
    } else {
      this.setData(this.validate(), () => {
        this.showToast(this.data.errMsg);
      });
    }
  },

  doSubmit () {
    // 1. call doRequestWithRefreshingToken to save address
    this.doRequestWithRefreshingToken();
    
    // 2. call setStorage to cache the addressForm datastructure
    
    // 3. jumpBack to the previous page
    // this.jumpBack();
  },
  doRequestWithRefreshingToken () {
    // console.log('submit address', this.data.form);
    const that = this;
    const expressId = wx.getStorageSync('expressId');
    doRequestWithRefreshingToken({
      mode: 'addr',
      url: 'common/address/edit',
      data: {
        poi: true,
        ...this.data.form,
        isDefault: false,
      },
      success: (data) => {
        const {resultData, resultCode, resultDesc} = data;
        if (resultCode === '0') {
         const addressId = resultData.id;
          wx.setStorage({
            key: 'addressId',
            data: addressId,
            success: () => {
              // 成功后跳转回原页面
              wx.removeStorageSync('addressForm');
              wx.redirectTo({
                url: `../expressAppoint/expressAppoint?id=${expressId}`
              });
            }
          });
          // that.jumpBack();
        } else {
          that.showToast(resultDesc);
          // that.showToast('列表获取错误，请稍后再试');
        }
      }
    });
  },

  saveAddress () {
    this.try2Submit();
  }
});

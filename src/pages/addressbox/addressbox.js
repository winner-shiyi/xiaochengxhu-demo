// 获取全局应用程序实例对象
// const app = getApp()

// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: 'addressbox'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    console.log('地址簿----', options);
    if (options.mode === 'send') {
      wx.setStorageSync('sendAddressData', {
        id: '发货id111588',
        detailAddress: '黄墩',
        name: '发货魏娜',
        city: '南平市',
        district: '建阳区',
        roomNo: '12',
        street: '莒口',
        phone: '15990245677',
        province: '福建省',
        pcdCode: '456',
      });
    } else if (options.mode === 'receive') {
      wx.setStorageSync('receiveAddressData', {
        id: '收货id111588',
        detailAddress: '黄墩',
        name: '收货魏娜',
        city: '南平市',
        district: '建阳区',
        roomNo: '12',
        street: '莒口',
        phone: '15990245677',
        province: '福建省',
        pcdCode: '456',
      });
    }

    // 路由传过来的id 命中 缓存中的
    if (options.sendAddrId === '发货id111588') {
      // 把编辑保存后的地址先更新缓存
      wx.setStorageSync('sendAddressData', {
        id: '发货id111588',
        detailAddress: '黄墩',
        name: '编辑发货严小飞',
        city: '上饶市',
        district: '建阳区',
        roomNo: '12',
        street: '莒口',
        phone: '15990245677',
        province: '江西省',
        pcdCode: '456',
      });
    } else if (options.receiveAddrId === '收货id111588' ) {
      wx.setStorageSync('receiveAddressData', {
        id: '收货id111588',
        detailAddress: '黄墩',
        name: '编辑收货严小飞',
        city: '上饶市',
        district: '建阳区',
        roomNo: '12',
        street: '莒口',
        phone: '15990245677',
        province: '江西省',
        pcdCode: '456',
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    // TODO: onReady
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    // TODO: onShow
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
  }
});

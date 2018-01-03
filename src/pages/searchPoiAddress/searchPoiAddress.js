// 获取全局应用程序实例对象
// const app = getApp();
const Util = require('../../utils/util');
const amapFile = require('../../libs/amap-wx.js'); // 如：..­/..­/libs/amap-wx.js
const config = require('../../config/config.js'); // 如：..­/..­/libs/amap-wx.js

/**
 * 为了保证高德小程序 SDK 中提供的功能的正常使用，需要设置安全域名。
 * 登录微信公众平台，在 "设置"－>"开发设置" 中设置 request 合法域名，将 https://restapi.amap.com 中添加进去
 */
const amapWeappSDKKey = config['amapWeappSDKKey'][config.current];
const amapInstance = new amapFile.AMapWX({key: amapWeappSDKKey});
// 创建页面实例对象
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mode: 'add',
    city: '定位失败',
    selectedCity: '杭州市',
    cities: ['杭州市', '宁波市', '金华市', '西安市'],
    cityIndex: -1,
    keywords: '',
    tips: [],
    isValidRegion: false,
    firstLoad: true,
    lonlat: '',
  },

  onLoad: function(options) {    
    this.setData({    
      mode: options.mode || 'add',    
    });
  },

  bindPickerChange: function(e) {
    const index = e.detail.value;
    const {
      cityIndex,
      cities,
      keywords,
    } = this.data;
    const city = cities[index];
    if (index !== cityIndex) {
      this.setData({
        cityIndex: index,
        selectedCity: city,
      }, () => {
        if (keywords != '') {
          this.doSearch();
        }
      });
    }
  },

  handleListItemTap(e) {
    const {
      currentTarget: {
        dataset: {
          index,
        },
      },
    } = e;
    const {
      tips,
      mode,
    } = this.data;

    const {
      name,
      location,
    } = tips[index];

    // console.log('tips', tips); 

    if (location) {
      // 点击中的情况下
      const [longitude, latitude] = location.split(',');
      const saveForm2StorageSync = (newProps = {}, store = {}) => {
        const baseForm = Object.assign({}, store);
        const newForm = Object.assign(baseForm, newProps);

        wx.setStorageSync('addressForm', newForm);
      };
      wx.getStorage({
        key: 'addressForm',
        success({ data }) {
          saveForm2StorageSync({
            detailAddress: name,
            latitude,
            longitude,
          }, data);
        },
        fail() {
          saveForm2StorageSync({
            detailAddress: name,
            latitude,
            longitude,
          });
        },
        complete() {
          // 根据之前的模式进行重定向，实际上这个参数没太多作用
          wx.redirectTo({
            url: `../addMyAddress/addMyAddress?mode=${mode}`,
          });
        },
      });
    }
  },

  searchDetail (e) {
    const keywords = e.detail.value;
    console.log('searchDetail', keywords);
    if (keywords != '') {
      this.setData({
        keywords,
      }, () => {
        this.doSearch();
      });
    } else {
      this.setData({
        tips: [],
      });
    }
  },

  doSearch() {
    const context = this;
    Util.throttle(() => {
      const {
        keywords,
        city,
        selectedCity,
        lonlat,
      } = this.data;
      amapInstance.getInputtips({
        keywords: `${selectedCity} ${keywords}`,
        location: lonlat,
        success: function(data){
          if(data && data.tips){
            context.setData({
              tips: data.tips,
            });
          } else {
            context.setData({
              tips: [],
            });
          }
        }
      })
    }, context, 400);
  },

  relocate() {
    const context = this;
    const {
      firstLoad,
      cities,
    } = context.data;
    // 1. 获取是否打开定位的设置
    wx.getSetting({
      success(res) {
        // 1.1. 未打开定位
        if (!res.authSetting['scope.userLocation']) {
          console.log('定位授权未被允许');
          wx.authorize({
            scope: 'scope.userLocation',
            success(res) {
              console.log('授权通过，开始定位');
              // 1.1.1 成功打开定位，进行初始化
              context.doRelocate(); 
            },
            fail() {
              // 1.1.2 用户拒绝打开定位，且是用户主动点击的情况下（firstLoad=false），才进行模态弹窗，引导用户打开定位权限
              if (!firstLoad) {
                console.log('授权被拒绝，打开授权设置页面');
                wx.showModal({
                  title: '微信授权',
                  content: '为了让您获得更好的体验，需要获取您的地理位置',
                  confirmText: '前往授权',
                  success(res) {
                    if (res.confirm) {
                      // 1.1.2.1 引导用户打开定位权限，且用户确定要打开
                      wx.openSetting({
                        success(res) {
                          if (res.authSetting['scope.userLocation']) {
                            context.doRelocate();
                          } else {
                            // 停留在原页面，不做处理
                          }
                        },
                      });
                    } else {
                      // 1.1.2.2 用户拒绝设置权限，选中第一个默认的可选城市
                      context.setData({
                        cityIndex: 0,
                        selectedCity: cities[0],
                      });
                    }
                  },
                });
              } else {
                console.log('拒绝授权');
                // 1.1.3 用户拒绝打开定位，但是是首次加载，不强制要求打开定位，只是默认选中第一个可选城市
                context.setData({
                  firstLoad: false,
                  cityIndex: 0,
                  selectedCity: cities[0],
                });
              }
            },
          });
        } else {
          console.log('定位授权已被允许');
          // 1.2. 已打开定位，直接进行定位的初始化
          context.doRelocate();
        }
      }
    })
  },

  doRelocate() {
    wx.showLoading({
      title: '定位中',
      success: () => {
        const context = this;
        amapInstance.getRegeo({
          success: function([data]){
            console.log('定位成功');
            console.log('data:', data);
            wx.hideLoading();
            const {
              name,
              desc,
              latitude,
              longitude,
              regeocodeData: {
                addressComponent: {
                  city,
                },
              },
            } = data; 
            const cityIndex = context.data.cities.indexOf(city);
            const isValidRegion = cityIndex >= 0;
            console.log('data', context.data.cities, city, isValidRegion); 
            context.setData({
              city,
              cityIndex,
              selectedCity: city,
              isValidRegion,
              firstLoad: false,
              lonlat: `${longitude},${latitude}`,
            });
          },
          fail: function(data) {
            console.log('定位失败');
            console.log('data:', data);
            // 失败回调
            wx.hideLoading();
            wx.showModal({
              title: '定位服务未开启',
              content: '为了让您获得更好的体验，需要您打开定位功能',
              confirmText: '立即开启',
              success: () => {
                context.setData({
                  cityIndex: 0,
                  selectedCity: context.data.cities[0],
                  firstLoad: false,
                  city: '定位失败',
                });
              },
            });
          }
        });
      },
    });
  }

});

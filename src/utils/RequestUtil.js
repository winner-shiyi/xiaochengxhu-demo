const Promise = require('./bluebird');
import Util from './util';
import { ToastPanel } from '../components/customizedToast/customizedToast.js';
// const LoginUtil = require('./LoginUtil');
const config = require('../config/config');
// const mockCache = require('./mock');
const currentENV = config.current;

export function TOKENSTATUS () {
  return {
    useless: '101021',
    expired: '101022'
  };
}
export function compareENV (env) {
  return currentENV === env;
}

/**
 * 获取高德地图server key
 */
export function getAmapServerKey () {
  const { amapServerKey } = config;
  const currentENV = currentENV;
  return amapServerKey[currentENV];
}

/**
 * 获取高德地图SDK key
 */
export function getAmapSDKKey () {
  const { amapSDKKey } = config;
  const currentENV = currentENV;
  return amapSDKKey[currentENV];
}

export function needMock () {
  return false;
}

export function getEnvPrefix (mode) {
  return config.apiUrl[currentENV][mode];
}

/**
 * [wxGetNetworkType 获取微信小程序当前的网络状态]
 * @return {[type]} [description]
 */
export function wxGetNetworkType() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: function(res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        resolve(res);
      },
      fail: function(...args) {
        reject(...args);
      }
    })
  });
}

/**
 * [doRequest 封装好的网络请求]
 * @param  {[type]} rawRequestOptions [description]
 * @return {[type]}                   [description]
 */
export function doRequest(rawRequestOptions) {
  return wxGetNetworkType().then((res) => {
    const { isConnected, networkType } = res;
    console.log('networkType:', networkType);
    if (isConnected) {
      wx.showToast({
        title: `无网络，请重试`,
        icon: 'loading',
        duration: 5000,
      });
    }
  }).then(() => {
    return wxRequest(rawRequestOptions);
  }).catch((err) => {
    throw err;
  });
}

export function doRequestWithRefreshingToken (rawRequestOptions) {
  const rawSuccessFn = rawRequestOptions.success || function () {};
  const rawFailFn = rawRequestOptions.fail || function () {};
  const rawCompleteFn = rawRequestOptions.complete || function () {};

  const fixedRequestOptions = Object.assign(rawRequestOptions, {
    success (data) {
      const { resultCode } = data;
      if (resultCode === '-5') {
        // 如果code反映当前是token过期的状态，先刷新token，再按原参数发新的请求
        refreshToken().then((newToken) => {
          return doRequest(rawRequestOptions);
        }).catch((errRes) => {
          if (errRes.resultCode === '-104') {
            // 如果code反映当前是token无效的状态，让用户5分钟后重试
            wx.showModal({
              title: '提示',
              content: '您已在其他设备上登录该账号，请5分钟后重新进入',
              showCancel: false,
              confirmColor: '#1aad19',
              confirmText: '知道了'
            });
          }
          console.error('Error occurs while refreshing token', errRes);
        });
      } else {
        rawSuccessFn(data);
      }
    },
    fail(...args) {
      rawFailFn(...args);
    },
    complete(...args) {
      rawCompleteFn(...args);
    }
  });

  return doRequest(fixedRequestOptions);
}

/**
 * [request description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
const MAX_RETRY_TIMES = 3; // 最大重连次数
let globalRequestId = 1;
let requestIdMap = {};
const isFunction = obj => typeof obj === 'function';
const isExisty = obj => obj != null;
export function wxRequest(rawRequestOptions, requestId = globalRequestId++) {

  const {
    url,
    absUrl = '',
    mode = 'fast',
    isAbsolute = false,
    method,
    dataType,
    responseType,
    header,
    success,
    complete,
    fail,
    data,
  } = rawRequestOptions;

  let reqUrl = isAbsolute ? absUrl : (getEnvPrefix(mode) + url);
  console.log('url, absUrl, mode, isAbsolute', url, absUrl, mode, isAbsolute, reqUrl);

  if (!isExisty(requestIdMap[requestId])) {
    // 首次进入的请求，记录请求的map
    requestIdMap[requestId] = {
      retry: 0,
      isSuccessful: false,
    };
  }

  console.log('requestId', requestId);
  console.log('requestIdMap', requestIdMap[requestId]);

  const requestTask = wx.request({
    url: reqUrl,
    method: isExisty(method) ? method.toUpperCase() : 'POST',
    dataType: dataType || 'json',
    header: header || {
      Authorization: wx.getStorageSync('token'),
    },
    data,
    responseType: responseType || 'text',
    success: function({ data, errMsg, statusCode, header }) {
      requestIdMap[requestId].isSuccessful = true;
      console.log(errMsg, statusCode, header);
      if (statusCode == 200) {
        success(data);
      } else {
        wx.showToast({
          title: `网络错误：${statusCode}`,
          icon: 'loading',
          duration: 5000,
        });
      }
    },
    fail: function({ errMsg }) {
      requestIdMap[requestId].retry += 1;
      if (requestIdMap[requestId].retry <= MAX_RETRY_TIMES) {
        // retry to connect
        wx.showToast({
          title: `[${requestIdMap[requestId].retry}/${MAX_RETRY_TIMES}]网络重连`,
          icon: 'loading',
          duration: 5000,
        })
        setTimeout(() => {
          wxRequest(rawRequestOptions, requestId);
        }, 2000);
      } else {
        // after
        wx.showToast({
          title: `网络异常`,
          icon: 'loading',
          duration: 5000,
        });
      }
    },
    complete: function(...args) {
      // clear reqeustMap
      if (requestIdMap[requestId].isSuccessful || requestIdMap[requestId].retry > MAX_RETRY_TIMES) {
        delete requestIdMap[requestId];
        globalRequestId++;
      } else {
        // do nothing
      }
      if (isFunction(complete)) {
        complete(...args);
      }
    }
  });

  return requestTask;
}

export function refreshToken() {
  return new Promise((resolve, reject) => {
    const refreshTokenUrl = 'wx/tuboboUser/refreshToken';

    doRequest({
      url: refreshTokenUrl,
      mode: 'wxserver',
      data: {
        token: wx.getStorageSync('token'),
        unionId: wx.getStorageSync('unionId')
      },
      success(res) {
        const {
          resultCode,
          resultDesc,
          resultData: {
            token
          }
        } = res;
        if (isResultSuccessful(res)) {
          wx.setStorageSync('token', token);
          resolve(token);
        } else {
          reject(res);
        }
      },
      fail(...args) {
        reject(...args);
      },
    });
  });
}

/*
  * [isResultSuccessful 判断Ajax返回信息是否成功]
  * @param {Object}  result [description]
  * @return  {Boolean}                    [description]
  */
export function isResultSuccessful (result) {
  return (result != null) && (result.code === '0' || result.resultCode === '0');
}


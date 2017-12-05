const Promise = require('./bluebird');
import {isExisty} from './util';
// const LoginUtil = require('./LoginUtil');
const CookieUtil = require('./CookieUtil');
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
  let prefixUrl;

  switch (mode) {
    case 'express':
    case 'addr':
      prefixUrl = config.apiUrl[currentENV][mode];
      break;
    case 'fast':
      prefixUrl = config.apiUrl[currentENV].fast;
      break;
    default:
      prefixUrl = config.apiUrl[currentENV].addr;
      break;
  }
  return prefixUrl;
}

/**
 * [fetch ajax 超时请求处理]
 * @param  {String}  method [description]
 * @param  {[type]}  url    [description]
 * @param  {Object}  data   [description]
 * @param  {[type]}  successFn      [description]
 * @param  {[type]}  errorFn        [description]
 * @param  {Boolean} isAbsolute     [description]
 * @param  {String}  absUrl  [description]
 * @param  {String}  mode [有两个ip地址，快递业务mode:express(默认)、地址业务mode:addr]
 */
export function fetch (fetchObj) {
  let {
    method = 'POST',
    url,
    data = {},
    successFn,
    errorFn,
    headers = {
      Authorization: 'E8ED7193B2407B54A81351EB8055BAC2D5CD3DE6ECC5F7BF2FA11B41201C1F9C9AEFD7E4C393BA3D198C00FED4B13F690EFCBDFB87F36BF8F95F5CBF1A1C77205573EF3C83BF886632224F2E39EC756DB8C4DC73917A8F800CCDB6F160934CCD364BA4AB8EE0872742BDA4661953E56EC29029B9C4BFDC87DCF6D4016AE1D360C982B0E9150C4C432112C19B11F4A2C9396BF44C2B18E59B7212AFBB9E8EC0E69248019759EB0DCC70C5B141381EB0A9A1FBE6A4C722AFF59F99373527A1DEEEFBEE41FC49E6D8215088DF185F8C56458DFA54FA6291EBE977ED87CC17575899B119E0F8B78431C0E8D12B786D72966E979B7AF84003002F10ED3BD911EF6E69E1D0312B956B98F2F1F392A2492A090BC0750C2BC2B6A4E208F3AC984AAA558E57B658E15E6BCD5A93F9E2624B11E77638D587C1999853FF1756E1F342D9327790C6CE97151A8A6B5F79D076A409F1234D831740A780909EA5C2A9E9EF7EE0B6498F254C4840AAAE5AF2655DB16AF1CE7F9FD7204CB1EC76CDC132412693C5EAF0E413DA511B82B535BE6B6BF6E8E56FC31EB08ACA6122C5D3A78F7BA0E8740E4E81589BD9EF893616EF2C0F4E520F28A85F36E76B387A313AEDB5625ADC5B2F',
    },
    isAbsolute = false,
    dataType = 'json',
    absUrl = '',
    mode = 'express'
  } = fetchObj;
  // console.log(fetchObj);
  if (needMock()) {
    // hook here
    // return mock data if it's in a dev env

    const promise = new Promise((resolve, reject) => {
      const mockData = fetchMockData(url);
      // console.log('mockData', mockData);
      if (successFn) {
        resolve(successFn(mockData));
      } else {
        reject(errorFn(mockData));
      }
    });
    return promise;
  }

  url = isAbsolute ? absUrl : (getEnvPrefix(mode) + url);

  // if (method.toLowerCase() === 'get') {
  //   if (Util.isExisty(data)) {
  //     url = `${url}?${$.param(data)}`;
  //   }
  //   data = null;
  // } else {
  //   data = JSON.stringify(data);
  // }
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      dataType,
      data: isExisty(data) ? data : {},
      header: headers,
      success: function (result) {
        const { useless, expired } = TOKENSTATUS();
        const code = result.resultCode || result.code;
        switch (code) {
          case expired:
            // window.sessionStorage.removeItem('token');
            refleshToken(() => { fetch(fetchObj); });
            break;
          case useless:
            // window.sessionStorage.removeItem('token');
            // LoginUtil.doWXAuth();
            break;
          default:
          // 当获取到token且能够正常请求数据时清除doWXAuthTimes
            window.sessionStorage.removeItem('doWXAuthTimes');
            successFn && successFn(result);
            break;
        }
      },
      fail: (args) => {
        errorFn && errorFn(...args);
      }
    });
  });
}

export function refleshToken (callback) {
  const expiredToken = Util.fetchToken();
  // window.sessionStorage.removeItem('token');
  CookieUtil.delCookie_h5('token');
  const param = {
    url: 'wx/tuboboUser/refreshToken',
    method: 'POST',
    data: {
      token: expiredToken
    },
    successFn (result) {
      if (isResultSuccessful(result)) {
        LoginUtil.setToken(result.resultData.token);
        CookieUtil.setCookie_h5('token', result.resultData.token);
        !!callback && callback();
      } else {
        LoginUtil.doWXAuth();
      }
    },
    errorFn (err) {
      LoginUtil.doWXAuth();
      throw new Error('刷新token失败', err);
    }
  };
  return fetch(param);
}

export function fetchMockData (url) {
  return mockCache[url];
}

/*
  * [isResultSuccessful 判断Ajax返回信息是否成功]
  * @param {Object}  result [description]
  * @return  {Boolean}                    [description]
  */
export function isResultSuccessful (result) {
  return (Util.isExisty(result) && Util.isExisty(result.code) && result.code === '0') || (Util.isExisty(result) && Util.isExisty(result.resultCode) && result.resultCode === '0');
}


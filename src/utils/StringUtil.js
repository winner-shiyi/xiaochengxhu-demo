import Util from './util';
import UrlUtil from './UrlUtil';

export default class StringUtil {
  /**
   * [padZeroLeft Use '0' to pad with given string]
   * @Author   JohnNong
   * @Email    overkazaf@gmail.com
   * @Github   https://github.com/overkazaf
   * @DateTime 2016-10-30T23:20:01+0800
   * @param    {[type]}                     str [description]
   * @param    {[type]}                     len [description]
   * @return   {[type]}                         [description]
   */
  static padZeroLeft (str, len) {
    if (str === null) return str;
    if (typeof str !== 'string') {
      try {
        str = String(str);
      } catch (e) {
        throw e;
      }
    }

    if (str.length < len) {
      str = StringUtil.repeat('0', len - str.length) + str;
    }

    return str;
  }

  /**
   * [repeat 使用矩阵快速幂来处理字符串连接]
   * @Author   JohnNong
   * @Email    overkazaf@gmail.com
   * @Github   https://github.com/overkazaf
   * @DateTime 2016-10-30T23:18:45+0800
   * @param    {[type]}                     ch    [description]
   * @param    {[type]}                     times [description]
   * @return   {[type]}                           [description]
   */
  static repeat (ch, times) {
    if (typeof ch !== 'string') throw new Error('Input must be a legal string');

    if (times <= 0) return '';

    if (times % 2 === 0) {
      return StringUtil.repeat(ch + ch, parseInt(times / 2, 10));
    }
    return ch + StringUtil.repeat(ch, times - 1);
  }

  static trim (str) {
    if (typeof str === 'string') {
      return str.replace(/(^\s*)|(\s*$)/g, '');
    }
    return str;
  }

  static parseQueryString (url) {
    let regUrl = /^[^[\]?]+\?([\w\W]+)$/;
    let regPara = /([^&=]+)=([\w\W]*?)(&|$)/g; // g is very important
    let arrUrl = regUrl.exec(url);
    let ret = {};
    if (arrUrl && arrUrl[1]) {
      let strPara = arrUrl[1];
      let result;
      while ((result = regPara.exec(strPara)) != null) {
        ret[result[1]] = result[2];
      }
    }

    let newRet = {};
    if (ret.state) {
      newRet = UrlUtil.tempRedirectParam2Obj(ret.state);
    }

    for (const k in ret) {
      if (k !== 'state') newRet[k] = ret[k];
    }

    return newRet;
  }
}

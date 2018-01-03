import Util from './util';
import config from '../config/config.json';
import StringUtil from './StringUtil';

/*
* get url prefix according to the env, default development
* */

export default class UrlUtil {
  /**
   * [getPageUrlByPageName 拼接出不带参数的页面Url]
   * @param  {String} pageName [description]
   * @return {[type]}         [description]
   */
  static getPageUrlByPageName (pageName) {
    const currentEnv = config.current;
    return `${config.pageUrl[currentEnv] + pageName}`;
  }

  /*
  * get url prefix according to the env, default development
  *
  */
  static getBaseUrl () {
    return '/';
  }

  /**
   * [getUrlByPageName 拼接出带参数的页面Url]
   * @param  {String} pageName [description]
   * @param  {Object} option [description]
   * @return {[type]}         [description]
   */
  static getUrlByPageName (pageName, option = {}) {
    let target = UrlUtil.getPageUrlByPageName(pageName);
    for (const key in option) {
      target = UrlUtil.appendParam4Url(target, key, option[key]);
    }
    return target;
  }

  /**
   * [appendParam4Url 给Url添加参数]
   * @param  {String} url [description]
   * @param  {String} paramKey [description]
   * @param  {[type]} paramValue [description]
   * @return {[type]}         [description]
   */
  static appendParam4Url (url, paramKey, paramValue) {
    let obj = StringUtil.parseQueryString(url);
    // const paramSubfix = `${paramKey}=${paramValue}`;
    let targetUrl = url.indexOf('?') >= 0 ? url.split('?')[0] : url;

    if (!obj) obj = {};

    obj[paramKey] = paramValue;

    if (targetUrl.indexOf('?') < 0) {
      targetUrl += '?';
    }

    Object.keys(obj).map((key, index) => {
      if (index > 0) targetUrl += '&';
      targetUrl += `${key}=${obj[key]}`;
      return targetUrl;
    });

    return targetUrl;
  }

  /**
   * [appendParams4Url 给Url添加批量参数]
   * @param  {String} pureUrl [description]
   * @param  {Object} options [description]
   * @return {[type]}         [description]
   */
  static appendParams4Url (pureUrl, options = {}) {
    let redirectUrl = pureUrl;

    for (const key in options) {
      redirectUrl = UrlUtil.appendParam4Url(redirectUrl, key, options[key]);
    }
    return redirectUrl;
  }

  /**
   * [fetchParamValueByCurrentURL 获取当前页面Url中对应key的值]
   * @param  {String} key [description]
   * @return {[type]}         [description]
   */
  static fetchParamValueByCurrentURL (key) {
    const obj = StringUtil.parseQueryString(location.href);

    let newObj = {};
    if (obj.state) { newObj = UrlUtil.tempRedirectParam2Obj(obj.state); }

    for (const k in obj) { if (k !== 'state') newObj[k] = obj[k]; }

    return newObj[key];
  }

  /**
   * [tempObj2redirectParam 将参数拼接为字符串 [key]1ssss1[value]1mmmm1[key]1ssss1[value]]
   * @param  {Object} options [description]
   * @return {String}         [description]
   */
  static tempObj2redirectParam (options) {
    if (Util.isEmptyObject(options)) {
      return null;
    }

    const equalSign = '1ssss1';
    const semiSign = '1mmmm1';

    const arr = [];
    Object.keys(options).map((key) => {
      arr.push(key + equalSign + options[key]);
      return '';
    });
    return arr.join(semiSign);
  }

  /**
   * [tempRedirectParam2Obj 将字符串 [key]1ssss1[value]1mmmm1[key]1ssss1[value] 拆分成对象]
   * @param  {String} url [description]
   * @return {String}         [description]
   */
  static tempRedirectParam2Obj (str) {
    let ret = null;
    const equalSign = '1ssss1';
    const semiSign = '1mmmm1';

    if (str != null) {
      let arr = [];
      ret = {};

      if (str.indexOf(semiSign) >= 0) {
        arr = str.split(semiSign);
        arr.map((kv) => {
          if (kv.indexOf(equalSign)) {
            const kvArray = kv.split(equalSign);
            ret[kvArray[0]] = kvArray[1];
          }
          return '';
        });
      } else if (str.indexOf(equalSign)) {
        const kvArray = str.split(equalSign);
        ret[kvArray[0]] = kvArray[1];
      }
    }

    return ret;
  }

  /**
   * [getPureUrl 剔除url参数]
   * @param  {String} url [description]
   * @return {String}         [description]
   */
  static getPureUrl (url) {
    const urlArr = /^([^[\]?]+)?/.exec(url);
    return urlArr ? urlArr[0] : url;
  }

  static redirectPage (pageName, options = {}) {
    const queryObj = StringUtil.parseQueryString(location.href);
    const hrefString = location.href.toString();
    const fixedHref = hrefString.indexOf('?') >= 0 ? hrefString.split('?')[0] : location.href;
    location.href = UrlUtil.getUrlByPageName(
      pageName,
      Object.assign(queryObj, {
        redirect_url: fixedHref
      }, options),
    );
  }

  /**
   * [getRouterSearch 配置router跳转的search值]
   * @param  {obj} option [description]
   * @return {String}  [description]
   */
  static getRouterSearch (option) {
    const keyArr = Object.keys(option);
    let searchStr = '';
    if (Util.isArray(keyArr) && keyArr.length) {
      searchStr = '?';
      keyArr.map((keyVal, index) => {
        if (index > 0) searchStr += '&';
        searchStr += `${keyVal}=${option[keyVal]}`;
        return searchStr;
      });
    }
    return searchStr;
  }
}

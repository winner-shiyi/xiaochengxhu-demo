const obj2str = Object.prototype.toString;
/**
 * 深拷贝
 * @param {*} obj
 */
export function deepClone (obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  let ret = new obj.constructor();

  if (isArray(obj)) {
    ret = [];
    for (let i = 0, l = obj.length; i < l; i++) {
      ret[i] = deepClone(obj[i]);
    }
  } else {
    if (obj instanceof Date) {
      return new Date(obj.valueOf());
    }

    if (obj instanceof RegExp) {
      const pattern = obj.valueOf();
      let flags = '';
      flags += pattern.global ? 'g' : '';
      flags += pattern.ignoreCase ? 'i' : '';
      flags += pattern.multiline ? 'm' : '';
      return new RegExp(pattern.source, flags);
    }

    if (obj instanceof Function) {
      // 函数的话直接指向相对的内存地址
      return obj;
    }

    for (const attr in obj) {
      if (Object.hasOwnProperty.call(obj, attr)) {
        ret[attr] = deepClone(obj[attr]);
      }
    }
  }
  return ret;
}

/**
 * [flatten Flatten an array, eg below:
 *           input: var array = [[1, 2, 3], [4, 5, 6], 7, [8]]]
 *           call: flatten(array);
 *           output: [1, 2, 3, 4, 5, 6, 7, 8]
 *
 * @Author   JohnNong
 * @Email    overkazaf@gmail.com
 * @Github   https://github.com/overkazaf
 * @DateTime 2016-11-02T16:47:20+0800
 * @param    {[type]}                     array [description]
 * @return   {[type]}                           [description]
 */
export function flatten (array) {
  let ret = [];

  array.forEach((item) => {
    if (isArray(item)) {
      ret = ret.concat(flatten(item));
    } else {
      ret.push(item);
    }
  });

  return ret;
}

// ============== Is 类似的工具函数，用于环境检测或是布尔判断 ==================== //

/**
 * [isExisty Check if a given var is existy]
 * @Author   JohnNong
 * @Email    overkazaf@gmail.com
 * @Github   https://github.com/overkazaf
 * @DateTime 2016-11-09T11:49:03+0800
 * @param    {[type]}                     obj [description]
 * @return   {Boolean}                        [description]
 */
export function isExisty (obj) {
  return obj != null;
}

export function isEmptyObject (options) {
  return options != null && Object.keys(options).length === 0;
}

export function isAos () {
  const __userAgent = navigator.userAgent;
  return !!__userAgent.match(/Android/i);
}

export function isIOS () {
  const __userAgent = navigator.userAgent;
  return !!__userAgent.match(/(iPhone|iPod|iPad)/i);
}

export function webSource () {
  if (isAos()) {
    return 3;
  } else if (isIOS()) {
    return 2;
  }
  return 1;
}

export function isEnv (env) {
  const userAgent = window.navigator.userAgent;
  return function () {
    return isExisty(userAgent.match(/(env.toString())/i));
  };
}

// static __isWeChat = isEnv('MicroMessenger');

export function isArray (obj) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(obj);
  }
  return isType(obj, 'Array');
}

export function isType (obj, type) {
  return obj2str.call(obj) === `[object ${type}]`;
}

export function throttle (method, context, delay = 200) {
  clearTimeout(method.tId);
  method.tId = setTimeout(() => {
    method.call(context);
  },
  delay);
}

// static throttleV2 (fn, delay, mustRunDelay, context) {
//   let timer = null;
//   let t_start;

//   return function () {
//     let args = arguments,
//       t_curr = +new Date();
//     clearTimeout(timer);

//     if (!t_start) {
//       t_start = t_curr;
//     }

//     if (t_curr - t_start >= mustRunDelay) {
//       fn.apply(context, args);
//       t_start = t_curr;
//     } else {
//       timer = setTimeout(() => {
//         fn.apply(context, args);
//       }, delay);
//     }
//   };
// }

// ============================ 图片懒加载工具 ========================== //
export function getLoadingImageSRC () {
  return 'http://yougo.xinguang.com/fightgroup-web/public/res/imgs/loading@3x.png';
}

/**
 * [lazyLoadeImages 图片懒加载函数]
 * @param  {[type]} $images [description]
 * @return {[type]}         [description]
 */
export function lazyLoadImages ($images, size = 8, timeout = 200) {
  let chunks = [];
  let tmp = [];
  $images = $images.filter((index, item) =>
    // 加载过的不处理
      typeof $(item).attr('data-src') !== 'undefined');

  // 从上到下进行排序，后边这个优先级算法可以放进algorithm里处理
  $images.sort((a, b) => {
    if ($(a).offset().top === $(b).offset().top) {
      return $(a).offset().left - $(b).offset().left;
    }
    return $(a).offset().top - $(b).offset().top;
  });

  $images.each((index, item) => {
    if (tmp.length < size) {
      tmp.push($(item));
    } else {
      chunks.push([...tmp]);
      tmp = [item];
    }
  });
  if (tmp.length) chunks.push(tmp);

  $.each(chunks, (index, chk) => {
    setTimeout(() => {
      $.each(chk, (idx, img) => {
        const $img = $(img);
        const src = $img.attr('data-src');
        if (src) {
          // 先把占位用的 default loading image放进去，图片加载完成再替换掉
          const $loadingImage = $('<div></div>').css({
            width: `${$img.width()}px`,
            height: `${$img.height()}px`,
            backgroundImage: `url(${getLoadingImageSRC()})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '50%',
            backgroundPosition: '50% 50%'
          });

          $loadingImage.insertAfter($img);

          $img.hide();
          $img.attr('src', src).on('load', () => {
            $loadingImage.remove();
            $img.show().removeAttr('data-src');
          });
        }
      });
    }, index * timeout);
  });
}

export function makeChunks (arr, chunkSize) {
  const target = [];
  let tmp = [];
  arr.map((item, index) => {
    if (tmp.length < chunkSize) {
      tmp.push(deepClone(item));
    } else {
      target.push(deepClone(tmp));
      tmp = [];
    }
  });

  if (tmp.length) {
    target.push([...tmp]);
  }

  return target;
}

export function cloneObjExceptParam (obj, paramName) {
  const newObj = {};
  for (const key in obj) {
    if (key !== paramName) { newObj[key] = obj[key]; }
  }
  return newObj;
}

export function deleteProperty (obj, paramName) {
  return Reflect.deleteProperty(obj, name);
}

export function dislodge (arr1, arr2) {
  for (let i = 0, len = arr2.length; i < len; i++) {
    const index = arr1.indexOf(arr2[i]);
    if (index >= 0) {
      arr1.splice(index, 1);
    }
  }
}

export function merge (arr1, arr2) {
  const ret = [];
  for (let i = 0, len1 = arr1.length; i < len1; i++) {
    ret.push(arr1[i]);
  }
  for (let j = 0, len2 = arr2.length; j < len2; j++) {
    if (!(ret.indexOf(arr2[j]) > -1)) {
      ret.push(arr2[j]);
    }
  }
  return ret;
}

export function ArrEveEleInAnother (arr1, arr2) {
  if (!arr1.length || !arr2.length) {
    return false;
  }
  let ret = true;
  for (let i = 0, len = arr1.length; i < len; i++) {
    if (arr2.indexOf(arr1[i]) === -1) {
      ret = false;
      break;
    }
  }
  return ret;
}

/**
 * [priceFormat 将价格如19.9拆分成数组['19','.9']]
 * @param {[type]} price [判断的字符串]
 * @return {[type]} [数字要求长度]
 */
export function priceFormat (price) {
  // isType(price, String) || (price = String(price));
  let inte = '0';
  let deci = '.00';
  if (price) {
    if (price.indexOf('.') !== -1) {
      const arr = price.split('.');
      inte = arr[0];
      deci = `.${arr[1]}`;
    } else {
      inte = price;
    }
  }
  return [inte, deci];
}

/**
 * [OnlyInt 仅能输入数字]
 * @param {[type]} text [判断的字符串]
 * @param {[type]} text [数字要求长度]
 */
export function OnlyInt (text, len) {
  let rtn = text.replace(/[^0-9]/g, '');
  if (rtn.length > len) {
    rtn = rtn.substring(0, len);
  }
  return rtn;
}

export function DomInView (el) {
  const rule = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };
  const bcr = el.getBoundingClientRect();
  const mw = el.offsetWidth;
  const mh = el.offsetHeight;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const boolX = (!((bcr.right - rule.left) <= 0 && ((bcr.left + mw) - rule.left) <= 0) && !((bcr.left + rule.right) >= w && (bcr.right + rule.right) >= (mw + w))); // ���·�������
  const boolY = (!((bcr.bottom - rule.top) <= 0 && ((bcr.top + mh) - rule.top) <= 0) && !((bcr.top + rule.bottom) >= h && (bcr.bottom + rule.bottom) >= (mh + h))); // ���·�������
  if (el.width !== 0 && el.height !== 0 && boolX && boolY) {
    return true;
  }
  return false;
}

/**
 * [limitStrLen 限制字数]
 * @param  {[type]} string [description]
 * @param  {[type]} num    [字数限制]
 * @return {[type]}        [description]
 */
export function limitStrLen (string, num) {
  if (string) {
    if (string.length > num) {
      string = string.substring(0, num);
      string += '...';
    }
  }
  return string;
}

/**
 * [onLine 判断是否连接网络]
 */
export function onLine () {
  return window.navigator && window.navigator.onLine;
}

/**
 * [loopDetection 判断函数是否超出限制]
 * @param {*} name 函数名称
 * @param {*} limitNum 限制次数
 * @param {*} time 多少时间内（s）
 */
export function loopDetection (name, limitNum, time) {
  // window.sessionStorage.setItem(name, 0);
  let loopDetection = window.sessionStorage.getItem(name);
  if (!loopDetection) {
    const loopDetectionTime = new Date().getTime();
    window.sessionStorage.setItem('loopDetectionTime', loopDetectionTime);
    loopDetection = 0;
  } else if (loopDetection > limitNum) {
    const loopDetectionTime = window.sessionStorage.getItem('loopDetectionTime');
    const newDate = new Date().getTime();
    if (loopDetectionTime && (parseInt(loopDetectionTime, 10) + (time * 1000)) > newDate) {
      return true;
    }
    window.sessionStorage.removeItem(name);
    return false;
  }
  window.sessionStorage.setItem(name, loopDetection + 1);
  return false;
}
/**
 * 时间戳转换为日期格式
 * @param {*} value
 * @param {*} format
 */
export function formatDate (value, format) {
  function fix (dTemp) {
    let d = dTemp;
    d = `${d}`;
    if (d.length <= 1) {
      d = `0${d}`;
    }
    return d;
  }
  const maps = {
    yyyy (d) { return d.getFullYear(); },
    MM (d) { return fix(d.getMonth() + 1); },
    dd (d) { return fix(d.getDate()); },
    HH (d) { return fix(d.getHours()); },
    mm (d) { return fix(d.getMinutes()); },
    ss (d) { return fix(d.getSeconds()); }
  };

  const chunk = new RegExp(Object.keys(maps).join('|'), 'g');

  function formatDateInside (valueTemp, formatTemp) {
    const formatTempvalue = formatTemp || 'yyyy-MM-dd HH:mm:ss';
    const valueTempValue = new Date(valueTemp);
    return formatTempvalue.replace(chunk, (capture) => (maps[capture] ? maps[capture](valueTempValue) : ''));
  }

  return formatDateInside(value, format);
}
/**
 * 去掉字符串首尾空格
 * @param {*} str
 */
export function utilTrim (str) {
  return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
}


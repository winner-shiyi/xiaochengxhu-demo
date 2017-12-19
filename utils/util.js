'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.deepClone = deepClone;
exports.flatten = flatten;
exports.isExisty = isExisty;
exports.isEmptyObject = isEmptyObject;
exports.isAos = isAos;
exports.isIOS = isIOS;
exports.webSource = webSource;
exports.isEnv = isEnv;
exports.isArray = isArray;
exports.isType = isType;
exports.throttle = throttle;
exports.getLoadingImageSRC = getLoadingImageSRC;
exports.lazyLoadImages = lazyLoadImages;
exports.makeChunks = makeChunks;
exports.cloneObjExceptParam = cloneObjExceptParam;
exports.deleteProperty = deleteProperty;
exports.dislodge = dislodge;
exports.merge = merge;
exports.ArrEveEleInAnother = ArrEveEleInAnother;
exports.priceFormat = priceFormat;
exports.OnlyInt = OnlyInt;
exports.DomInView = DomInView;
exports.limitStrLen = limitStrLen;
exports.onLine = onLine;
exports.loopDetection = loopDetection;
exports.formatDate = formatDate;
exports.utilTrim = utilTrim;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var obj2str = Object.prototype.toString;
/**
 * 深拷贝
 * @param {*} obj
 */
function deepClone(obj) {
  if (obj === null || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return obj;

  var ret = new obj.constructor();

  if (isArray(obj)) {
    ret = [];
    for (var i = 0, l = obj.length; i < l; i++) {
      ret[i] = deepClone(obj[i]);
    }
  } else {
    if (obj instanceof Date) {
      return new Date(obj.valueOf());
    }

    if (obj instanceof RegExp) {
      var pattern = obj.valueOf();
      var flags = '';
      flags += pattern.global ? 'g' : '';
      flags += pattern.ignoreCase ? 'i' : '';
      flags += pattern.multiline ? 'm' : '';
      return new RegExp(pattern.source, flags);
    }

    if (obj instanceof Function) {
      // 函数的话直接指向相对的内存地址
      return obj;
    }

    for (var attr in obj) {
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
function flatten(array) {
  var ret = [];

  array.forEach(function (item) {
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
function isExisty(obj) {
  return obj != null;
}

function isEmptyObject(options) {
  return options != null && Object.keys(options).length === 0;
}

function isAos() {
  var __userAgent = navigator.userAgent;
  return !!__userAgent.match(/Android/i);
}

function isIOS() {
  var __userAgent = navigator.userAgent;
  return !!__userAgent.match(/(iPhone|iPod|iPad)/i);
}

function webSource() {
  if (isAos()) {
    return 3;
  } else if (isIOS()) {
    return 2;
  }
  return 1;
}

function isEnv(env) {
  var userAgent = window.navigator.userAgent;
  return function () {
    return isExisty(userAgent.match(/(env.toString())/i));
  };
}

// static __isWeChat = isEnv('MicroMessenger');

function isArray(obj) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(obj);
  }
  return isType(obj, 'Array');
}

function isType(obj, type) {
  return obj2str.call(obj) === '[object ' + type + ']';
}

function throttle(method, context) {
  var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

  clearTimeout(method.tId);
  method.tId = setTimeout(function () {
    method.call(context);
  }, delay);
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
function getLoadingImageSRC() {
  return 'http://yougo.xinguang.com/fightgroup-web/public/res/imgs/loading@3x.png';
}

/**
 * [lazyLoadeImages 图片懒加载函数]
 * @param  {[type]} $images [description]
 * @return {[type]}         [description]
 */
function lazyLoadImages($images) {
  var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
  var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

  var chunks = [];
  var tmp = [];
  $images = $images.filter(function (index, item) {
    return (
      // 加载过的不处理
      typeof $(item).attr('data-src') !== 'undefined'
    );
  });

  // 从上到下进行排序，后边这个优先级算法可以放进algorithm里处理
  $images.sort(function (a, b) {
    if ($(a).offset().top === $(b).offset().top) {
      return $(a).offset().left - $(b).offset().left;
    }
    return $(a).offset().top - $(b).offset().top;
  });

  $images.each(function (index, item) {
    if (tmp.length < size) {
      tmp.push($(item));
    } else {
      chunks.push([].concat(_toConsumableArray(tmp)));
      tmp = [item];
    }
  });
  if (tmp.length) chunks.push(tmp);

  $.each(chunks, function (index, chk) {
    setTimeout(function () {
      $.each(chk, function (idx, img) {
        var $img = $(img);
        var src = $img.attr('data-src');
        if (src) {
          // 先把占位用的 default loading image放进去，图片加载完成再替换掉
          var $loadingImage = $('<div></div>').css({
            width: $img.width() + 'px',
            height: $img.height() + 'px',
            backgroundImage: 'url(' + getLoadingImageSRC() + ')',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '50%',
            backgroundPosition: '50% 50%'
          });

          $loadingImage.insertAfter($img);

          $img.hide();
          $img.attr('src', src).on('load', function () {
            $loadingImage.remove();
            $img.show().removeAttr('data-src');
          });
        }
      });
    }, index * timeout);
  });
}

function makeChunks(arr, chunkSize) {
  var target = [];
  var tmp = [];
  arr.map(function (item, index) {
    if (tmp.length < chunkSize) {
      tmp.push(deepClone(item));
    } else {
      target.push(deepClone(tmp));
      tmp = [];
    }
  });

  if (tmp.length) {
    target.push([].concat(_toConsumableArray(tmp)));
  }

  return target;
}

function cloneObjExceptParam(obj, paramName) {
  var newObj = {};
  for (var key in obj) {
    if (key !== paramName) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

function deleteProperty(obj, paramName) {
  return Reflect.deleteProperty(obj, name);
}

function dislodge(arr1, arr2) {
  for (var i = 0, len = arr2.length; i < len; i++) {
    var index = arr1.indexOf(arr2[i]);
    if (index >= 0) {
      arr1.splice(index, 1);
    }
  }
}

function merge(arr1, arr2) {
  var ret = [];
  for (var i = 0, len1 = arr1.length; i < len1; i++) {
    ret.push(arr1[i]);
  }
  for (var j = 0, len2 = arr2.length; j < len2; j++) {
    if (!(ret.indexOf(arr2[j]) > -1)) {
      ret.push(arr2[j]);
    }
  }
  return ret;
}

function ArrEveEleInAnother(arr1, arr2) {
  if (!arr1.length || !arr2.length) {
    return false;
  }
  var ret = true;
  for (var i = 0, len = arr1.length; i < len; i++) {
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
function priceFormat(price) {
  // isType(price, String) || (price = String(price));
  var inte = '0';
  var deci = '.00';
  if (price) {
    if (price.indexOf('.') !== -1) {
      var arr = price.split('.');
      inte = arr[0];
      deci = '.' + arr[1];
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
function OnlyInt(text, len) {
  var rtn = text.replace(/[^0-9]/g, '');
  if (rtn.length > len) {
    rtn = rtn.substring(0, len);
  }
  return rtn;
}

function DomInView(el) {
  var rule = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };
  var bcr = el.getBoundingClientRect();
  var mw = el.offsetWidth;
  var mh = el.offsetHeight;
  var w = window.innerWidth;
  var h = window.innerHeight;
  var boolX = !(bcr.right - rule.left <= 0 && bcr.left + mw - rule.left <= 0) && !(bcr.left + rule.right >= w && bcr.right + rule.right >= mw + w); // ���·�������
  var boolY = !(bcr.bottom - rule.top <= 0 && bcr.top + mh - rule.top <= 0) && !(bcr.top + rule.bottom >= h && bcr.bottom + rule.bottom >= mh + h); // ���·�������
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
function limitStrLen(string, num) {
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
function onLine() {
  return window.navigator && window.navigator.onLine;
}

/**
 * [loopDetection 判断函数是否超出限制]
 * @param {*} name 函数名称
 * @param {*} limitNum 限制次数
 * @param {*} time 多少时间内（s）
 */
function loopDetection(name, limitNum, time) {
  // window.sessionStorage.setItem(name, 0);
  var loopDetection = window.sessionStorage.getItem(name);
  if (!loopDetection) {
    var loopDetectionTime = new Date().getTime();
    window.sessionStorage.setItem('loopDetectionTime', loopDetectionTime);
    loopDetection = 0;
  } else if (loopDetection > limitNum) {
    var _loopDetectionTime = window.sessionStorage.getItem('loopDetectionTime');
    var newDate = new Date().getTime();
    if (_loopDetectionTime && parseInt(_loopDetectionTime, 10) + time * 1000 > newDate) {
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
function formatDate(value, format) {
  function fix(dTemp) {
    var d = dTemp;
    d = '' + d;
    if (d.length <= 1) {
      d = '0' + d;
    }
    return d;
  }
  var maps = {
    yyyy: function yyyy(d) {
      return d.getFullYear();
    },
    MM: function MM(d) {
      return fix(d.getMonth() + 1);
    },
    dd: function dd(d) {
      return fix(d.getDate());
    },
    HH: function HH(d) {
      return fix(d.getHours());
    },
    mm: function mm(d) {
      return fix(d.getMinutes());
    },
    ss: function ss(d) {
      return fix(d.getSeconds());
    }
  };

  var chunk = new RegExp(Object.keys(maps).join('|'), 'g');

  function formatDateInside(valueTemp, formatTemp) {
    var formatTempvalue = formatTemp || 'yyyy-MM-dd HH:mm:ss';
    var valueTempValue = new Date(valueTemp);
    return formatTempvalue.replace(chunk, function (capture) {
      return maps[capture] ? maps[capture](valueTempValue) : '';
    });
  }

  return formatDateInside(value, format);
}
/**
 * 去掉字符串首尾空格
 * @param {*} str
 */
function utilTrim(str) {
  return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
}
module.exports = {
  current: 'dev',
  apiUrl: {
    local: {
      addr: 'https://test.toobob.com/tbbadminqafc/',
      express: 'https://test.toobob.com/tbbexpressqafc/',
      fast: 'http://sjyxtest.yiqiguang.com/legwork/',
      wxserver: 'https://test.toobob.com/tbbwxserverqafc/',
    },
    dev: {
      addr: 'https://test.toobob.com/tbbadminqafc/',
      express: 'https://test.toobob.com/tbbexpressqafc/',
      fast: 'http://sjyxtest.yiqiguang.com/legwork/',
      wxserver: 'https://test.toobob.com/tbbwxserverqafc/',
    },
    pre: {
      addr: 'https://adminuat.toobob.com/',
      express: 'https://expressuat.toobob.com/',
      fast: 'https://legworkuat.toobob.com/',
      wxserver: 'https://wxbackuat.toobob.com/',
    },
    qaif: {
      addr: 'http://sjyxtest.yiqiguang.com/adminqaif/',
      express: 'http://sjyxtest.yiqiguang.com/expressqaif/',
      fast: 'http://sjyxtest.yiqiguang.com/legworkqaif/',
      wxserver: 'http://sjyxtest.yiqiguang.com/wxqaif/',
    },
    qafc: {
      addr: 'https://test.toobob.com/tbbadminqafc/ ',
      express: 'https://test.toobob.com/tbbexpressqafc/',
      fast: 'http://sjyxtest.yiqiguang.com/legwork/',
      wxserver: 'https://test.toobob.com/tbbwxserverqafc/',
    },
    online: {
      addr: 'https://admin.toobob.com/',
      express: 'https://express.toobob.com/',
      fast: 'https://legwork.toobob.com/',
      wxserver: 'https://wxback.toobob.com/',
    },
  },

  pageUrl: {
    local: 'http://172.16.26.90:8090/',
    dev: 'http://tbtest.yiqiguang.com/',
    pre: 'https://assistantuat.toobob.com/',
    qaif: 'http://tbtest.yiqiguang.com/',
    qafc: 'http://tbtest.yiqiguang.com/',
    online: 'https://assistant.toobob.com/',
  },
  amapSDKKey: {
    dev: '64fc6019bf58fb544bb5d508ad92078e',
    qafc: '64fc6019bf58fb544bb5d508ad92078e',
    pre: '64fc6019bf58fb544bb5d508ad92078e',
    online: '64fc6019bf58fb544bb5d508ad92078e',
  },
  amapWeappSDKKey: {
    dev: '6c5baba5a8dad5246caf69c911294515',
    qafc: '6c5baba5a8dad5246caf69c911294515',
    pre: '6c5baba5a8dad5246caf69c911294515',
    online: '6c5baba5a8dad5246caf69c911294515',
  },
  amapServerKey: {
    dev: '9de67c2d55cef1fc08103c775c851e9b',
    qafc: '9de67c2d55cef1fc08103c775c851e9b',
    pre: '9de67c2d55cef1fc08103c775c851e9b',
    online: 'd0c8b8ef2220ff02202aa85db28064b2',
  },
  wxTxt: {
    dev: {
      name: 'MP_verify_Z0jawSgXHHCclgUE',
      content: 'Z0jawSgXHHCclgUE',
    },
    qafc: {
      name: 'MP_verify_Z0jawSgXHHCclgUE',
      content: 'Z0jawSgXHHCclgUE',
    },
    pre: {
      name: ' MP_verify_1f2hzUufQbmIEuOe',
      content: '1f2hzUufQbmIEuOe',
    },
    online: {
      name: ' MP_verify_K1A5wGSof2fHcbF8',
      content: 'K1A5wGSof2fHcbF8',
    },
  },
  countly: {
    sdk: {
      local: 'http://172.16.2.52/sdk/web/countly.min.js',
      dev: 'http://countly.toobob.com/sdk/web/countly.min.js',
      qaif: 'http://countly.toobob.com/sdk/web/countly.min.js',
      qafc: 'http://countly.toobob.com/sdk/web/countly.min.js',
      pre: 'http://countly.toobob.com/sdk/web/countly.min.js',
      online: 'http://countly.toobob.com/sdk/web/countly.min.js',
    },
    appKey: {
      local: '3aacc4aae035e72b2b2d53a02bbbda3e7fce57bd',
      dev: 'a889d437b710cb21be9cbf547bbe840919998ba6',
      qaif: 'a889d437b710cb21be9cbf547bbe840919998ba6',
      qafc: 'a889d437b710cb21be9cbf547bbe840919998ba6',
      pre: 'a889d437b710cb21be9cbf547bbe840919998ba6',
      online: '26442605655f2f0444bbd351dd452e00ad338af4',
    },
    url: {
      local: 'http://172.16.2.52',
      dev: 'http://countly.toobob.com',
      qaif: 'http://countly.toobob.com',
      qafc: 'http://countly.toobob.com',
      pre: 'http://countly.toobob.com',
      online: 'http://countly.toobob.com',
    },
  },
};

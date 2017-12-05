class PromiseAjax {
  constructor() {
    this.baseUrl = 'http://127.0.0.1:8888/';
    this.headers = {
      'content-type': 'application/json',
      'token': wx.getStorageSync('token'),
    }
  }
  ajax(url, params, headers, type) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseUrl}${url}`,
        data: params,
        method: type,
        header: Object.assign({}, this.headers, headers),
        success: function (res) {
          if (res.data.resultCode === '0') {
            resolve(res.data);
          } else {
            reject(res.data.resultDesc);
          }
        },
        fail: function (err) {
          reject(err)
        },
      })
    })
  }
  get(url, params, headers = {}) {
    return this.ajax(url, params, headers, 'GET')
  }
  post(url, params, headers = {}) {
    return this.ajax(url, params, headers, 'POST')
  }
}

export { PromiseAjax };
export default new PromiseAjax();
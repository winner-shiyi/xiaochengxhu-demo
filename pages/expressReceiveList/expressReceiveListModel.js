// import { Base } from '../../utils/base.js';

const app = getApp();

class ExpressReceiveList {
  constructor() {
  }

  /**
   * 请求快递订单列表接口
   */
  getOrderData(id, callback) {
    // var param = {
    //   url: 'theme/' + id,
    //   sCallback: function (data) {
    //     callback && callback(data);
    //   }
    // };
    // this.request(param);
    const params = {
      method: 'POST',
      url: 'wx/express/fast/address/list',
      mode: 'fast',
      data: {},
      successFn: (result) => {
        console.log(result);
        callback && callback(result)
      },
      errorFn: () => {
        console.log(arguments);
      }
    };
    // app.RequestUtil.fetch(params);
  }

  /*获得元素上的绑定的值*/
  getDataSet(event, key) {
    return event.currentTarget.dataset[key];
  };
};

export { ExpressReceiveList };
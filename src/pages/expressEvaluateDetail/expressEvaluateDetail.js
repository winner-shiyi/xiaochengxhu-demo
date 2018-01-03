import {doRequestWithRefreshingToken, isResultSuccessful} from '../../utils/RequestUtil.js';
// 创建页面实例对象
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    expressId: '',
    evalEfficiency: '',
    evalAttitude: '',
    effi: {
      key: 'effi',
      stars: [
        0, 0, 0, 0, 0
      ],
      count: 0
    },
    atti: {
      key: 'atti',
      stars: [
        0, 0, 0, 0, 0
      ],
      count: 0
    },
    evalComment: '',
    canSubmit: false
  },

  /**
  * 点击星星获取星星数目
  */
  onLoad (options) {
    app.ToastPanel();
    app.HandleStar().inject({
      getIndex (index, type, stars) {
        let dat = {};
        dat[type] = {
          key: type,
          stars: stars,
          count: index + 1
        };
        this.setData(dat);
        this.checkRule();
      }
    });
    const expressId = options.id;
    this.setData({
      expressId: expressId
    });
  },

  /**
   * changeValue函数主要实现textarea实时输入
   */
  changeValue (e) {
    const evaluateRemark = e.detail.value;
    this.setData({
      evalComment: evaluateRemark
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    // TODO: onReady
  },

  /**
   * 校验按钮能否提交
   */
  checkRule () {
    const {
      effi,
      atti
    } = this.data;

    this.setData({
      evalEfficiency: effi.count.toString(),
      evalAttitude: atti.count.toString()
    });

    if (+this.data.evalEfficiency >= 1 && +this.data.evalAttitude >= 1) {
      this.setData({
        canSubmit: true
      });
    }
  },

  /**
   * 提交评价
   */
  submitEvaluate () {
    const that = this;
    const {
      evalEfficiency,
      evalAttitude
    } = that.data;

    if (+evalEfficiency < 1) {
      that.setData({
        canSubmit: false
      });
      that.showToast('配送时效评价星级不能为空！');
      return;
    }

    if (+evalAttitude < 1) {
      that.setData({
        canSubmit: false
      });
      that.showToast('服务态度评价星级不能为空！');
      return;
    }
    that.fetchAjax();
  },

  /**
   * 向后台发请求
   */
  fetchAjax () {
    const {
      expressId,
      evalComment,
      evalAttitude,
      evalEfficiency
    } = this.data;
    const param = {
      mode: 'express',
      url: 'wxcx/evaluate',
      method: 'POST',
      data: {
        id: expressId,
        evalComment,
        evalAttitude,
        evalEfficiency,
        evaluateType: 'TBB_RATE_RECEIVE'
      },
      success: (result) => {
        if (result.resultCode === '200' || result.resultCode === '0') {
          this.showToast('评价成功');
          wx.redirectTo({
            url: `../expressReceiveDetail/expressReceiveDetail?id=${expressId}`
          });
        } else {
          this.showToast('评价失败,请稍等再试');
        }
      }
    };
    doRequestWithRefreshingToken(param);
  }
});

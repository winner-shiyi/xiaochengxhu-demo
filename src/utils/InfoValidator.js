
/**
 * [validateByRule 提供了常用的校验规则]
 * @param  {[type]} option [description]
 * @return {[type]}        [description]
 */
export function validateByRule (option) {
  const rules = {
    notNull (value) {
      return typeof value !== 'undefined' && value.trim() !== '';
    },
    isMobile (value) {
      const reMobile = /^1[3|4|5|7|8|][0-9]{9}$/;
      return reMobile.test(value);
    },
    isID (value) {
      const reID = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      return reID.test(value);
    },
    isVerifyCode (value) {
      const reID = /(^\d{6}$)/;
      return reID.test(value);
    },
    isName (value) {
      const reID = /(^[\u4E00-\u9FA5A-Za-z0-9_]*$)/;
      return reID.test(value);
    }
  };
  const {
    type, errorMessage, data
  } = option;
  const successFlag = rules[type](data.currentValue, data);
  return {
    success: successFlag,
    message: successFlag ? '' : errorMessage
  };
}

export function validInfoByFormatedForm (form) {
  for (let i = 0, el; el = form[i++];) {
    const rules = el.validateRules;

    if (!el.isRequired) continue;

    for (let j = 0, rule; rule = rules[j++];) {
      const currentResult = validateByRule({
        type: rule.rule,
        param: rule.param,
        errorMessage: rule.errorMessage,
        data: el
      });

      if (!currentResult.success) {
        return currentResult;
      }
    }
  }

  return {
    success: true,
    message: '校验通过'
  };
}

export function validatePersonInfo (personInfo) {
  const composePersonForm = function (info) {
    const arr = [];

    // 依待校验的格式处理人员信息
    arr.push({
      currentValue: info.name,
      isRequired: true,
      validateRules: [
        { rule: 'notNull', param: {}, errorMessage: '姓名不能为空', data: { currentValue: info.name } },
        { rule: 'isName', param: {}, errorMessage: '姓名只能由中文、英文和数字组成', data: { currentValue: info.name } }
      ]
    });

    // 依待校验的格式处理联系电话
    arr.push({
      currentValue: info.phone,
      isRequired: true,
      validateRules: [
        { rule: 'notNull', param: {}, errorMessage: '手机号码不能为空', data: { currentValue: info.phone } },
        { rule: 'isMobile', param: {}, errorMessage: '手机号码格式非法', data: { currentValue: info.phone } }
      ]
    });

    return arr;
  };
  return validInfoByFormatedForm(composePersonForm(personInfo));
}

export function validatePlaceInfo (placeInfo) {
  const composePlaceForm = function (info) {
    const arr = [];

    // 依待校验的格式处理人员信息
    arr.push({
      currentValue: info.area,
      isRequired: true,
      validateRules: [
        { rule: 'notNull', param: {}, errorMessage: '所在区域不能为空', data: { currentValue: info.area } }
      ]
    });

    // 依待校验的格式处理联系电话
    arr.push({
      currentValue: info.detail,
      isRequired: true,
      validateRules: [
        { rule: 'notNull', param: {}, errorMessage: '详细地址不能为空', data: { currentValue: info.detail } }
      ]
    });

    return arr;
  };
  return validInfoByFormatedForm(composePlaceForm(placeInfo));
};

export function validate () {
  const { person, place } = this.options;

  const personInfoResult = validatePersonInfo(person);
  if (!personInfoResult.success) {
    return personInfoResult;
  }

  const placeInfoResult = validatePlaceInfo(place);
  if (!placeInfoResult.success) {
    return placeInfoResult;
  }

  return {
    success: true,
    message: '校验通过'
  };
}


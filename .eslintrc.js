module.exports ={
  "env": {
    "browser": true,
    "es6": true
  },
  "parser": "babel-eslint",
  "plugins": [
    'promise',
    'json'
  ],
  "globals": {
    "getCurrentPages": true,
    "wx": true,
    "getApp": true,
    "App": true,
    "Page": true,
    "require": true,
    "$": true,
    "DEBUG": true,
    "WeixinJSBridge": true
  },
  "extends": "airbnb",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "global-require": "off",
    "import/no-unresolved": "off",
    "no-underscore-dangle": "off",
    "no-new-func": "off",
    "no-param-reassign": 1,
    "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
    "no-restricted-syntax": "off",
    "no-unused-expressions": [2, {"allowShortCircuit": true, "allowTernary": true, "allowTaggedTemplates": true}],
    "arrow-parens": [2, "always"],
    "object-shorthand": "off",
    "func-names": "off",
    "space-before-function-paren": "off",
  }
};

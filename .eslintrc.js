module.exports ={
  "env": {
    "browser": true,
    "es6": true
  },
  "parser": "babel-eslint",
  "plugins": [
    'standard',
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
  "extends": "standard",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "indent": [
      "warn",
      2,
      {
          "SwitchCase": 1
      }
    ],
    "quotes": [
      "warn",
      "single"
    ],
    "semi": [
      "warn",
      "always"
    ],
    "no-console": [
      "warn",
      {
        "allow": [
          "log",
          "warn"
        ]
      }
    ],
    "no-func-assign": [
      "off"
    ],
    "no-constant-condition": [
      "off"
    ]
  }
};

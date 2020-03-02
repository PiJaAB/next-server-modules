const path = require('path');

module.exports = {
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended',
    'prettier'
  ],
  plugins: [
  ],
  parserOptions: {
    ecmaVersion: 10
  },
  rules: {
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-underscore-dangle': ['error', { allow: ['_id', '__typename'] }],
    'no-console': ['off'],
    'import/no-extraneous-dependencies': ['error'],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.'
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.'
      }
    ]
  },
  env: {
    jest: true,
    node: true,
    es6: true,
  },
  globals: {
  },
  settings: {
  }
}

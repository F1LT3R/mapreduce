module.exports = {
  extends: ['plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['prettier'],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  ignorePatterns: ['node_modules'],
  rules: {
    'prettier/prettier': 'error',
    'no-undef': 'error'
  }
};

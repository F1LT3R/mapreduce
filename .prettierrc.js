module.exports = {
  trailingComma: 'none',
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  printWidth: 80,
  endOfLine: 'lf',
  arrowParens: 'always',
  bracketSpacing: true,
  trailingComma: 'all',
  proseWrap: 'never',
  overrides: [
    {
      files: '*.md',
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: '*.json',
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
  ],
};

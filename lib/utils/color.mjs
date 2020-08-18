const codes = {
  resetAll: '\u001B[0m',
  bold: '\u001B[1m',
  dim: '\u001B[2m',
  underlined: '\u001B[4m',
  blink: '\u001B[5m',
  reverse: '\u001B[7m',
  hidden: '\u001B[8m',
  resetBold: '\u001B[21m',
  resetDim: '\u001B[22m',
  resetUnderlined: '\u001B[24m',
  resetBlink: '\u001B[25m',
  resetReverse: '\u001B[27m',
  resetHidden: '\u001B[28m',
  default: '\u001B[39m',
  black: '\u001B[30m',
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  magenta: '\u001B[35m',
  cyan: '\u001B[36m',
  lightGray: '\u001B[37m',
  darkGray: '\u001B[90m',
  lightRed: '\u001B[91m',
  lightGreen: '\u001B[92m',
  lightYellow: '\u001B[93m',
  lightBlue: '\u001B[94m',
  lightMagenta: '\u001B[95m',
  lightCyan: '\u001B[96m',
  white: '\u001B[97m',
};

const wrap = (code, text) => `${code}${text}${codes.resetAll}`;

export const resetAll = (text) => wrap(codes.resetAll, text);
export const bold = (text) => wrap(codes.bold, text);
export const dim = (text) => wrap(codes.dim, text);
export const underlined = (text) => wrap(codes.underlined, text);
export const blink = (text) => wrap(codes.blink, text);
export const reverse = (text) => wrap(codes.reverse, text);
export const hidden = (text) => wrap(codes.hidden, text);
export const resetBold = (text) => wrap(codes.resetBold, text);
export const resetDim = (text) => wrap(codes.resetDim, text);
export const resetUnderlined = (text) => wrap(codes.resetUnderlined, text);
export const resetBlink = (text) => wrap(codes.resetBlink, text);
export const resetReverse = (text) => wrap(codes.resetReverse, text);
export const resetHidden = (text) => wrap(codes.resetHidden, text);
export const DEFAULT = (text) => wrap(codes.default, text);
export const black = (text) => wrap(codes.black, text);
export const red = (text) => wrap(codes.red, text);
export const green = (text) => wrap(codes.green, text);
export const yellow = (text) => wrap(codes.yellow, text);
export const blue = (text) => wrap(codes.blue, text);
export const magenta = (text) => wrap(codes.magenta, text);
export const cyan = (text) => wrap(codes.cyan, text);
export const lightGray = (text) => wrap(codes.lightGray, text);
export const darkGray = (text) => wrap(codes.darkGray, text);
export const lightRed = (text) => wrap(codes.lightRed, text);
export const lightGreen = (text) => wrap(codes.lightGreen, text);
export const lightYellow = (text) => wrap(codes.lightYellow, text);
export const lightBlue = (text) => wrap(codes.lightBlue, text);
export const lightMagenta = (text) => wrap(codes.lightMagenta, text);
export const lightCyan = (text) => wrap(codes.lightCyan, text);
export const white = (text) => wrap(codes.white, text);

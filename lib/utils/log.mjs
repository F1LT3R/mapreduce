import { red, yellow, green, lightMagenta } from './color';

export const log = (message, ...rest) => console.log(message, ...rest);

export const warn = (message, ...rest) => console.log(yellow(message), ...rest);

export const error = (message, ...rest) => console.log(red(message), ...rest);

export const ok = (message, ...rest) => console.log(green(message), ...rest);

export const talk = (message, ...rest) =>
  console.log(lightMagenta(message), ...rest);

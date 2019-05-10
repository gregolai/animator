import { color } from '@sqs/utils';
import clamp from 'lodash/clamp';
import isNumber from 'lodash/isNumber';

export default {
  color: str => {
    return color.parseColor(str);
  },
  easing: str => {
    return str; // could actually be an array
  },
  enum: (str, list) => {
    return list.indexOf(str) !== -1 ? str : undefined;
  },
  float: (str, { min = Number.MIN_VALUE, max = Number.MAX_VALUE } = {}) => {
    return clamp(parseFloat(str), min, max);
  },
  integer: (str, { round = true, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) => {
    let v = parseFloat(str);
    return clamp(round ? Math.round(v) : Math.floor(v), min, max);
  },
  milliseconds: str => {
    let num = parseFloat(str);
    if (!isNumber(str)) {
      if (str.endsWith('s') && !str.endsWith('ms')) {
        num *= 1000;
      }
    }
    return Math.floor(num);
  },
  ratio: str => {
    return clamp(parseFloat(str), 0, 1);
  }
}
import { normalizeFloat } from 'common';

const lerpFloat = (from, to, t) => normalizeFloat(from + t * (to - from));
const lerpInteger = (from, to, t) => Math.round(lerpFloat(from, to, t))

export default {
  color: (from, to, t) => {
    const red = lerpInteger(from.red, to.red, t);
    const green = lerpInteger(from.green, to.green, t);
    const blue = lerpInteger(from.blue, to.blue, t);
    const alpha = lerpFloat(from.alpha, to.alpha, t);
    return { red, green, blue, alpha };
  },
  float: (from, to, t) => {
    return lerpFloat(from, to, t);
  },
  integer: (from, to, t) => {
    return lerpInteger(from, to, t);
  },
  static: (from, to, t) => {
    return t < 0.5 ? from : to;
  }
}
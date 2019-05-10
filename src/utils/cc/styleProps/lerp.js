
const lerpFloat = (from, to, t) => from + t * (to - from);

export default {
  color: (from, to, t) => {
    const red = lerpFloat(from.red, to.red, t);
    const green = lerpFloat(from.green, to.green, t);
    const blue = lerpFloat(from.blue, to.blue, t);
    const alpha = lerpFloat(from.alpha, to.alpha, t);
    return { red, green, blue, alpha };
  },
  float: (from, to, t) => {
    return lerpFloat(from, to, t);
  },
  integer: (from, to, t) => {
    return Math.round(lerpFloat(from, to, t));
  },
  static: (from, to, t) => {
    return t < 0.5 ? from : to;
  }
}
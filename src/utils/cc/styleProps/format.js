import clamp from 'lodash/clamp';

const isSeconds = v => {
  return typeof v === 'string' && v.endsWith('s') && !v.endsWith('ms');
};

export default {
  color: v => {
    const r = Math.round(v.red);
    const g = Math.round(v.green);
    const b = Math.round(v.blue);
    const a = Number(v.alpha).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  },
  deg: v => {
    return `${v}deg`;
  },
  easing: v => {
    if (Array.isArray(v)) {
      return `cubic-bezier(${v[0]}, ${v[1]}, ${v[2]}, ${v[3]})`;
    }
    return v;
  },
  imageUrl: v => {
    return `url("${v}")`;
  },
  milliseconds: v => {
    if (typeof v === 'number') {
      return `${v}ms`;
    }
    if (isSeconds(v)) {
      v *= 1000;
    }
    return `${parseInt(v, 10)}ms`;
  },
  pixels: v => {
    return `${Math.round(parseFloat(v))}px`;
  },
  ratio: (v, precision = 2) => {
    return `${clamp(v, 0, 1).toFixed(precision)}`;
  }
};

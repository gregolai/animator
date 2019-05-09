import clamp from 'lodash/clamp';
import kebabCase from 'lodash/kebabCase';

const isSeconds = v => {
  return typeof v === 'string' && v.endsWith('s') && !v.endsWith('ms');
}

// FORMATTERS
const formatRatio = (v, precision = 2) => {
  return `${clamp(v, 0, 1).toFixed(precision)}`;
}
const formatPixels = v => {
  return `${Math.round(parseFloat(v))}px`;
};
const formatMS = v => {
  if (typeof v === 'number') return `${v}ms`;
  if (isSeconds(v)) return `${parseInt(v * 1000, 10)}ms`;
  return `${parseInt(v, 10)}ms`;
}
const formatEasing = v => {
  if (Array.isArray(v)) return `cubic-bezier(${v[0]}, ${v[1]}, ${v[2]}, ${v[3]})`;
  return v;
}
// const formatTransform = v => {
//   // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d
//   const [
//     a1, b1, c1, d1,
//     a2, b2, c2, d2,
//     a3, b3, c3, d3,
//     a4, b4, c4, d4
//   ] = v;
//   return `matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
// }
const formatColor = v => {
  if (typeof v === 'object') {
    const r = Math.round(v.red);
    const g = Math.round(v.green);
    const b = Math.round(v.blue);
    const a = Number(v.alpha).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a}`;
  }
  return v;
}
const formatImageUrl = v => `url("${v}")`;

// INTERPOLATORS
const lerpNumber = (from, to, t) => from + t * (to - from);

const stylePropMap = {
  animationDelay: {
    format: v => formatMS(v)
  },
  animationDuration: {
    format: v => formatMS(v)
  },
  animationTimingFunction: {
    format: v => formatEasing(v)
  },
  backgroundColor: {
    format: v => formatColor(v),
    lerp: (from, to, t) => {
      const red = lerpNumber(from.red, to.red, t);
      const green = lerpNumber(from.green, to.green, t);
      const blue = lerpNumber(from.blue, to.blue, t);
      const alpha = lerpNumber(from.alpha, to.alpha, t);
      return { red, green, blue, alpha };
    },
  },
  backgroundImage: {
    format: v => formatImageUrl(v)
  },
  backgroundRepeat: {
    format: v => v
  },
  bottom: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },
  height: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },
  left: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },
  marginBottom: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },
  marginLeft: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },
  marginRight: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },
  marginTop: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },
  opacity: {
    format: v => formatRatio(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },
  position: {
    format: v => v
  },
  right: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },
  top: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  },

  // TODO: STORE AS MATRIX4x4
  // transform: {
  //   format: v => formatTransform(v)
  // },

  width: {
    format: v => formatPixels(v),
    lerp: (from, to, t) => lerpNumber(from, to, t)
  }
}

const stylePropArray = [];

Object.keys(stylePropMap).forEach(styleName => {
  const entry = stylePropMap[styleName];
  entry.id = styleName;                 // e.g. id = backgroundColor
  entry.cssName = kebabCase(styleName); // e.g. cssName = background-color
  stylePropArray.push(entry)
})

export const getStyleProp = (propId) => {
  return stylePropMap[propId];
}

export const canInterpolate = (propId) => {
  const entry = getStyleProp(propId);
  return entry && entry.lerp !== undefined;
}


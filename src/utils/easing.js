import bezierEasing from 'bezier-easing';

/**
 * Cubic bezier equivalents:
 * https://www.w3.org/TR/css-easing-1/#typedef-cubic-bezier-timing-function
 */
const EASING_MAP = {
  linear: [0.5, 0.5, 0.5, 0.5],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1]
};

export const getEasingArray = easing => {
  return Array.isArray(easing) ? easing : EASING_MAP[easing] || EASING_MAP.linear;
};

export const getEasingOptions = () =>
  Object.keys(EASING_MAP).map(name => ({
    label: name,
    value: name
  }));

export const getPointAtTime = (t, easing) => {
  const [X1, Y1, X2, Y2] = getEasingArray(easing); // control points

  // https://github.com/gre/bezier-easing/blob/master/src/index.js
  const fn = bezierEasing(X1, Y1, X2, Y2);
  const y = fn(t);

  return y;
};

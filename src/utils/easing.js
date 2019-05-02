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

// https://stackoverflow.com/questions/8217346/cubic-bezier-curves-get-y-for-given-x
// P0 = (X0,Y0)
// P1 = (X1,Y1)
// P2 = (X2,Y2)
// P3 = (X3,Y3)
export const getPointAtTime = (t, easing) => {
  const [X0, Y0] = [0, 0];
  const [X1, Y1, X2, Y2] = getEasingArray(easing); // control points
  const [X3, Y3] = [1, 1];

  const it = 1 - t;

  // SOLVE: X(t) = (1-t)^3 * X0 + 3*(1-t)^2 * t * X1 + 3*(1-t) * t^2 * X2 + t^3 * X3
  const x = it * it * it * X0 + 3 * it * it * t * X1 + 3 * it * t * t * X2 + t * t * t * X3;

  // SOLVE: Y(t) = (1-t)^3 * Y0 + 3*(1-t)^2 * t * Y1 + 3*(1-t) * t^2 * Y2 + t^3 * Y3
  const y = it * it * it * Y0 + 3 * it * it * t * Y1 + 3 * it * t * t * Y2 + t * t * t * Y3;

  return { x, y };
};

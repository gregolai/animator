import clamp from 'lodash/clamp';

const FLOAT_PRECISION = 2;

export const TIME_STEP_SECONDS = 1 / Math.pow(10, FLOAT_PRECISION);

export const normalizeTime = time => {
  time = Number(time).toFixed(FLOAT_PRECISION);
  time = parseFloat(time);
  time = clamp(time, 0, 1);
  return time;
}
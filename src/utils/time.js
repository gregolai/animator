import { roundToInterval } from 'utils';
import { INTERVAL_MS } from './constants';
const FLOAT_PRECISION = 2;

export const TIME_STEP_SECONDS = 1 / Math.pow(10, FLOAT_PRECISION);

export const normalizeTime = time => {
  time = roundToInterval(time, INTERVAL_MS);
  time = Math.max(0, time);
  return time;
}
import { roundToInterval } from 'utils';
import { INTERVAL_MS } from './constants';

export const normalizeTime = time => {
  time = roundToInterval(time, INTERVAL_MS);
  time = Math.max(0, time);
  return time;
}
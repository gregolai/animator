import last from 'lodash/last';
import { getPointAtTime } from './easing';

/**
 * @param {Array<{ time: number, value: number }>} keyframes
 * @param {number} time
 * @param {(v0: any, v2: any, time: number) => any} lerpFunction
 * @param {Array|string} easing
 */
const interpolate = (keyframes, time, lerpFunction, easing) => {
  // early exit if no keyframes
  if (keyframes.length === 0) return undefined;
  if (keyframes.length === 1) return keyframes[0].value;

  if (time <= keyframes[0].time) return keyframes[0].value;
  if (time >= last(keyframes).time) return last(keyframes).value;

  let kf0, kf1;
  for (let i = 0; i < keyframes.length - 1; ++i) {
    if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
      kf0 = keyframes[i];
      kf1 = keyframes[i + 1];
      break;
    }
  }

  if (!kf0 || !kf1) {
    console.error('This should never happen!');
    return undefined;
  }

  const { time: fromTime, value: fromValue } = kf0;
  const { time: toTime, value: toValue } = kf1;

  const span = toTime - fromTime;
  if (span <= 0) return fromValue; // prevent divide-by-zero

  // interpolate
  const scaledTime = (time - fromTime) / span;
  const { y: curvedTime } = getPointAtTime(scaledTime, easing);

  return lerpFunction(fromValue, toValue, curvedTime);
};

export default interpolate;

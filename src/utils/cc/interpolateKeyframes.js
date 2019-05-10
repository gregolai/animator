import first from 'lodash/first';
import last from 'lodash/last';
import isNumber from 'lodash/isNumber';
import { getPointAtTime } from './easing';

/**
 * @param {Array<{ time: number, value: any }>} keyframes
 * @param {number} time
 */
const getNearestKeyframes = (keyframes, time) => {
  let kf0;
  let kf1;
  for (let i = 0; i < keyframes.length; ++i) {
    const kf = keyframes[i];
    const t = kf.time;

    // Get nearest keyframe BEFORE time
    if (t <= time && (!kf0 || t > kf0.time)) {
      kf0 = kf;
    }

    // Get nearest keyframe AFTER time
    if (t >= time && (!kf1 || t < kf1.time)) {
      kf1 = kf;
    }
  }

  return { kf0, kf1 };
};

/**
 * @param {Array<{ time: number, value: any }>} keyframes
 * @param {number} time
 * @param {(v0: any, v2: any, time: number) => any} lerpFunction
 * @param {Array|string} easing
 */
const interpolateKeyframes = (keyframes, time, lerpFunction, easing) => {
  if (!isNumber(time)) {
    // TIME IS NOT A NUMBER
    console.warn('Cannot interpolate. Time is not a number', {
      keyframes,
      time,
      easing
    });
    return undefined;
  }

  // early exit if no keyframes
  if (keyframes.length === 0) {
    return undefined;
  }
  if (keyframes.length === 1) {
    return keyframes[0].value;
  }

  if (time <= first(keyframes).time) {
    return first(keyframes).value;
  }
  if (time >= last(keyframes).time) {
    return last(keyframes).value;
  }

  const { kf0, kf1 } = getNearestKeyframes(keyframes, time);

  if (!kf0 || !kf1) {
    console.error('Cannot interpolate. This should never happen!', {
      kf0,
      kf1,
      keyframes,
      time,
      easing
    });
    return undefined;
  }

  const { time: fromTime, value: fromValue } = kf0;
  const { time: toTime, value: toValue } = kf1;

  const span = toTime - fromTime;
  if (span <= 0) {
    return fromValue;
  } // prevent divide-by-zero

  // interpolate
  const scaledTime = (time - fromTime) / span; // [0, 1] linear
  const curvedTime = getPointAtTime(scaledTime, easing); // [0, 1] curved

  // linear interpolate along curved time
  return lerpFunction(fromValue, toValue, curvedTime);
};

export default interpolateKeyframes;

import last from 'lodash/last';
import isNumber from 'lodash/isNumber';
import { getPointAtTime } from './easing';

const getNearestKeyframes = (keyframes, time) => {
	let kf0;
	let kf1;

	for (let i = 0; i < keyframes.length; ++i) {
		const kf = keyframes[i];
		const t = kf.time;
		if (t <= time && (!kf0 || t > kf0.time)) {
			kf0 = kf;
		}

		if (t >= time && (!kf1 || t < kf1.time)) {
			kf1 = kf;
		}
	}

	return { kf0, kf1 };
};

/**
 * @param {Array<{ time: number, value: number }>} keyframes
 * @param {number} time
 * @param {(v0: any, v2: any, time: number) => any} lerpFunction
 * @param {Array|string} easing
 */
const interpolate = (keyframes, time, lerpFunction, easing) => {
	if (!isNumber(time)) return undefined;

	// early exit if no keyframes
	if (keyframes.length === 0) return undefined;
	if (keyframes.length === 1) return keyframes[0].value;

	if (time <= keyframes[0].time) return keyframes[0].value;
	if (time >= last(keyframes).time) return last(keyframes).value;

	const { kf0, kf1 } = getNearestKeyframes(keyframes, time);

	if (!kf0 || !kf1) {
		console.log({ kf0, kf1, keyframes, time, easing });
		console.error('This should never happen!');
		return undefined;
	}

	if (kf0 === kf1) return kf0.value;

	const { time: fromTime, value: fromValue } = kf0;
	const { time: toTime, value: toValue } = kf1;

	const span = toTime - fromTime;
	if (span <= 0) return fromValue; // prevent divide-by-zero

	// interpolate
	const scaledTime = (time - fromTime) / span;
	const curvedTime = getPointAtTime(scaledTime, easing);

	return lerpFunction(fromValue, toValue, curvedTime);
};

export default interpolate;

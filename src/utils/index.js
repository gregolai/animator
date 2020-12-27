import randomColor from 'randomcolor';
import clamp from 'lodash/clamp';

export { default as createUniqueName } from './createUniqueName';
export { startDrag } from './mouse';
export { default as PlaybackController } from './PlaybackController';

// for grid snap
export const roundToInterval = (value, interval) => {
	return Math.round(value / interval) * interval;
};

export const normalizeFloat = (time, precision = 2) => {
	const n = parseFloat(Number(time).toFixed(precision));
	return isNaN(n) ? 0 : n;
};

export const normalizeRatio = (time, precision = 2) => {
	return clamp(normalizeFloat(time, precision), 0, 1);
};

export const getRandomColor = () => randomColor();

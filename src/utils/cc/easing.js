import bezierEasing from 'bezier-easing';
import { normalizeFloat } from '../index';
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

const createCache = maxSize => {
	let head, tail, size = 0, lookup = {};
	return {
		get: key => lookup[key],
		set: (key, value) => {
			if (size < maxSize) {
				const arr = [key, null];
				if (head) head[1] = arr;
				head = arr;
				if (!tail) tail = head;
				++size;
			} else {
				const [killKey, next] = tail;
				delete lookup[killKey];
				tail = next;
			}
			lookup[key] = value;
		}
	};
};

const fnCache = createCache(60);
const yValueCache = createCache(2000);

export const getPointAtTime = (t, easing) => {
	const [X1, Y1, X2, Y2] = getEasingArray(easing); // control points

	// A balance is needed here.
	// Smaller precision appears too jumpy
	// Larger precision has more cache misses
	t = normalizeFloat(t, 3);

	const FN_CACHE_KEY = `${X1}_${Y1}_${X2}_${Y2}`;
	const Y_CACHE_KEY = `${FN_CACHE_KEY}_${t}`;

	// TRY GET Y VALUE
	let y = yValueCache.get(Y_CACHE_KEY);
	if (y !== undefined) {
		return y;
	}

	// TRY GET FUNCTION
	let fn = fnCache.get(FN_CACHE_KEY);
	if (!fn) {
		// https://github.com/gre/bezier-easing/blob/master/src/index.js
		fn = bezierEasing(X1, Y1, X2, Y2);

		// SET CACHE FUNCTION
		fnCache.set(FN_CACHE_KEY, fn);
	}

	y = fn(t);

	// SET CACHE Y VALUE
	yValueCache.set(Y_CACHE_KEY, y);
	return y;
};

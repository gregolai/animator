/*
  This file is the bridge between the transition styles API and web. We expose
  certain style props and transform them in the targets. This is necessary
  because react-native doesn't use CSS, but instead, works with Animated.Value
  and Animated.ValueXY objects for transition interpolation.
*/

import { toPx } from '../utils';

const lookup = {
	backgroundColor: (v) => ({
		backgroundColor: v
	}),

	height: (v) => ({
		height: toPx(v)
	}),

	opacity: (v) => ({
		opacity: v
	}),

	rotateZ: (v) => ({
		transform: `rotateZ(${v}deg)`
	}),

	scale: (v) => ({
		transform: `scale(${v.x}, ${v.y})`
	}),
	scaleX: (v) => ({
		transform: `scaleX(${v})`
	}),
	scaleY: (v) => ({
		transform: `scaleY(${v})`
	}),

	translate: (v) => ({
		transform: `translate(${toPx(v.x)}, ${toPx(v.y)})`
	}),
	translateX: (v) => ({
		transform: `translateX(${toPx(v)})`
	}),
	translateY: (v) => ({
		transform: `translateY(${toPx(v)})`
	}),

	width: (v) => ({
		width: toPx(v)
	})
};

/**
 * Transform the API style object into a CSS style object
 * @param {Object} style an inline style object
 */
export default (apiStyle) => {
	if (!apiStyle) {
		return {};
	}

	const resolvedStyle = {};

	// TODO: Ensure transform order: translate, rotate, scale
	const transformValues = [];

	Object.keys(apiStyle).forEach((propName) => {
		const transformer = lookup[propName];
		if (transformer) {
			const propValue = apiStyle[propName];
			const styleObj = transformer(propValue);

			if (styleObj.transform) {
				// Special case for transform styles (scale/rotate/translate)
				transformValues.push(styleObj.transform);
			} else {
				Object.assign(resolvedStyle, styleObj);
			}
		} else {
			// Passthrough for styles that don't have a transform
			resolvedStyle[propName] = apiStyle[propName];
		}
	});

	// CSS transform values need to be joined with spaces
	// For example:
	// transform: 'translateX(10px) rotateZ(30deg) scale(2, 2)'
	if (transformValues.length > 0) {
		resolvedStyle.transform = transformValues.join(' ');
	}

	return resolvedStyle;
};

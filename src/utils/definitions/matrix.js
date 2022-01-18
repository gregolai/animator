import isEqual from 'lodash/isEqual';

// MATRIX LIBRARIES
import toMatrix4 from 'css-transform-to-mat4';
import decompose from 'mat4-decompose';
import recompose from 'mat4-recompose';
import interpolateMatrix from 'mat4-interpolate';

export const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export const lerpMatrix = (from, to, t) => {
	let out = [];
	if (!interpolateMatrix(out, from, to, t)) {
		console.warn('Matrix interpolation failed:', { from, to, t });
		out = from;
	}
	return out;
};

export const parseMatrix = (str) => {
	const v = toMatrix4(str);
	for (let i = 0; i < 16; ++i) {
		// check for invalid entries
		if (isNaN(v[i])) {
			return IDENTITY_MATRIX;
		}
	}
	return v;
};

export const formatMatrix = (v) => {
	// https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d
	const [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4] = v;
	return `matrix3d(${a1}, ${b1}, ${c1}, ${d1}, ${a2}, ${b2}, ${c2}, ${d2}, ${a3}, ${b3}, ${c3}, ${d3}, ${a4}, ${b4}, ${c4}, ${d4})`;
};

export const decomposeMatrix = (v) => {
	const translation = [];
	const scale = [];
	const skew = [];
	const perspective = [];
	const quaternion = [];

	decompose(v, translation, scale, skew, perspective, quaternion);
	return {
		translateX: translation[0],
		translateY: translation[1],
		translateZ: translation[2],

		scaleX: scale[0],
		scaleY: scale[1],
		scaleZ: scale[2],

		skewXY: skew[0],
		skewXZ: skew[1],
		skewYZ: skew[2],

		perspectiveX: perspective[0],
		perspectiveY: perspective[1],
		perspectiveZ: perspective[2],
		perspectiveW: perspective[3],

		rotateX: quaternion[0],
		rotateY: quaternion[1],
		rotateZ: quaternion[2],
		rotateW: quaternion[3]
	};
};

export const recomposeMatrix = ({
	translateX,
	translateY,
	translateZ,

	scaleX,
	scaleY,
	scaleZ,

	skewXY,
	skewXZ,
	skewYZ,

	perspectiveX,
	perspectiveY,
	perspectiveZ,
	perspectiveW,

	rotateX,
	rotateY,
	rotateZ,
	rotateW
}) => {
	const translation = [translateX, translateY, translateZ];
	const scale = [scaleX, scaleY, scaleZ];
	const skew = [skewXY, skewXZ, skewYZ];
	const perspective = [perspectiveX, perspectiveY, perspectiveZ, perspectiveW];
	const quaternion = [rotateX, rotateY, rotateZ, rotateW];

	const out = [];
	recompose(out, translation, scale, skew, perspective, quaternion);
	return out;
};

window.top.testMe = (transformString) => {
	const mat = parseMatrix(transformString);
	const decomposed = decomposeMatrix(mat);
	const mat2 = recomposeMatrix(decomposed);

	return [isEqual(mat, mat2), mat, mat2, decomposed];
};

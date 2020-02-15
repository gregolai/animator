import { createUniqueName, getRandomColor } from 'utils';
import rework from 'rework';
import { CSSLint } from 'csslint';
import jsonBeautify from 'json-beautify';
import db from 'utils/db';

export const lintJSF = jsfString => {
	jsfString = jsfString.trim();

	const warnings = [];
	const errors = [];

	const isValid = jsfString[0] === '{' && jsfString[jsfString.length - 1] === '}';
	if (!isValid) {
		errors.push({ message: 'This is not valid JSF' });
	}

	return { warnings, errors };
};

export const lintCSS = cssString => {
	const { messages } = CSSLint.verify(cssString);
	const warnings = messages.filter(v => v.type === 'warning');
	const errors = messages.filter(v => v.type === 'error');
	return { warnings, errors };
};

export const importJSF = jsfString => {
	const jsfObject = JSON.parse(jsfString);

	const animations = [];
	const keyframes = [];
	const instances = [];
	const tweens = [];

	Object.entries(jsfObject.animations || {}).forEach(([animationId, jsfAnimation]) => {
		// create animation
		db.createOne(
			animations,
			{
				id: animationId,
				color: getRandomColor(),
				name: jsfAnimation.name || createUniqueName()
			},
			true
		);

		Object.entries(jsfAnimation.keyframes || {}).forEach(([definitionId, jsfKeyValuePairs]) => {
			// create tween
			const { item: tween } = db.createOne(
				tweens,
				{
					animationId,
					definitionId
				},
				true
			);
			const tweenId = tween.id;

			jsfKeyValuePairs.forEach(([time, value]) => {
				// prevent duplicate keyframe times
				if (db.getOne(keyframes, kf => kf.tweenId === tweenId && kf.time === time).item)
					return;

				// create keyframe
				db.createOne(
					keyframes,
					{
						animationId,
						tweenId,
						time,
						value
					},
					true
				);
			});
		});
	});

	Object.entries(jsfObject.instances || {}).forEach(([instanceId, jsfInstance]) => {
		// require animation
		const animationId = jsfInstance.animation;
		if (!db.getOne(animations, animationId).item) return;

		db.createOne(
			instances,
			{
				animationId,
				color: getRandomColor(),
				definitionValues: jsfInstance.baseProps,
				id: instanceId,
				name: jsfInstance.name || createUniqueName()
			},
			true
		);
	});

	return { animations, keyframes, instances, tweens };
};

export const exportJSF = ({ animations, instances, keyframes, tweens }) => {
	const jsfObject = {
		type: 'animated',
		properties: {
			/**
			 * animations: {
			 *   [animationId]: {
			 *     keyframes: {
			 *       [definitionId]: [
			 *         [keyframeTime, keyframeValue]
			 *       ],
			 *     },
			 *     name
			 *   }
			 * }
			 */
			animations: animations.reduce((map, animation) => {
				map[animation.id] = {
					keyframes: tweens
						.filter(t => t.animationId === animation.id)
						.reduce((map, tween) => {
							map[tween.definitionId] = keyframes
								.filter(kf => kf.tweenId === tween.id)
								.sort((a, b) => (a.time < b.time ? -1 : 1))
								.map(kf => [kf.time, kf.value]);

							return map;
						}, {}),
					name: animation.name
				};

				return map;
			}, {}),

			/**
			 * instances: {
			 *   [instanceId]: {
			 *     animation,
			 *     baseProps: {
			 *       [definitionId]: parsedValue
			 *     },
			 *     name
			 *   }
			 * }
			 */
			instances: instances.reduce((map, instance) => {
				map[instance.id] = {
					animation: instance.animationId,
					baseProps: instance.definitionValues,
					name: instance.name
				};

				return map;
			}, {})
		}
	};

	const jsfString = jsonBeautify(jsfObject, null, 2, 100);

	return jsfString;
};

// const jsf = {
//   type: 'keyframes',
//   properties: {
//     animations: {
//       "4st5mb6u": {
//         keyframes: {
//           'background-color': [
//             [0.1, '#fa6900'],
//             [0.4, '#69d2e7'],
//             [0.7, '#542437']
//           ],
//           'opacity': [
//             [0.1, 1],
//             [0.4, 0.4],
//             [0.9, 0.7]
//           ]
//         },
//         name: 'icy-catshark'
//       }
//     },
//     instances: {
//       "1ve71j3p": {
//         animation: '4st5mb6u',
//         baseProps: {
//           'animation-duration': 2400,
//           'animation-timing-function': "ease-in-out",
//           'height': 30,
//           'position': "absolute",
//           'width': 30
//         },
//         name: 'instance1'
//       }
//     }
//   }
// }

import { React, cx } from 'common';
import { AnimationStore, UIStore } from 'stores';
import { Canvas } from 'components/shared';
import { Box } from 'pu2';

import { timeToPixels } from './utils';

const DELAY_COLOR = '#a1a1a1';
const DURATION_COLOR = '#d2d2d2';

const drawKeyframe = (ctx, x, y) => {
	ctx.fillStyle = 'black';
	ctx.fillRect(x - 3, y - 3, 8, 8);

	ctx.fillStyle = 'white';
	ctx.fillRect(x - 2, y - 2, 6, 6);
};

const InstanceTimeline = ({ className, instance }) => {
	const { getTweens, getKeyframes, getInstanceDefinitionValue } = AnimationStore.use();
	const { isInstanceHidden, tickSpacing } = UIStore.use();

	const isHidden = isInstanceHidden(instance.id);
	const delay = getInstanceDefinitionValue(instance.id, 'animationDelay');
	const duration = getInstanceDefinitionValue(instance.id, 'animationDuration');

	const tweens = getTweens(instance.animationId);
	const height = tweens.length * 22;

	return (
		<Box
			height={`${height}px`}
			position="relative"
			opacity={isHidden ? '0.2' : '1'}
			transition="opacity 250ms ease-in-out"
			width="100%"
		>
			<Canvas
				onFrame={(ctx) => {
					const { width, height } = ctx.canvas;
					ctx.clearRect(0, 0, width, height);

					const pxDelay = timeToPixels(delay, tickSpacing);
					const pxDuration = timeToPixels(duration, tickSpacing);

					// delay bar
					if (delay > 0) {
						ctx.fillStyle = DELAY_COLOR;
						ctx.fillRect(0, 0, pxDelay, height);
					}

					// duration bar
					ctx.fillStyle = DURATION_COLOR;
					ctx.fillRect(pxDelay, 0, pxDuration, height);

					// render tween bars
					tweens.forEach((tween, tweenIndex, tweens) => {
						const keyframes = getKeyframes(tween.id);
						const y = Math.round((tweenIndex + 1) * (height / (tweens.length + 1)));

						let x0, x1;
						for (let i = 0; i < keyframes.length - 1; ++i) {
							x0 = pxDelay + Math.floor(keyframes[i].time * pxDuration);
							x1 = pxDelay + Math.floor(keyframes[i + 1].time * pxDuration);

							ctx.fillStyle = 'black';
							ctx.fillRect(x0, y, x1 - x0, 2);

							// draw keyframe
							drawKeyframe(ctx, x0, y);
						}

						// draw last keyframe
						drawKeyframe(ctx, x1, y);
					});
				}}
			/>
		</Box>
	);
};

export default InstanceTimeline;

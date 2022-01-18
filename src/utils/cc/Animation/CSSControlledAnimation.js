import React, { useContext } from 'react';
import AnimationStore from '../AnimationStore';

export default ({
	children,

	/**
	 * Animation delay, in milliseconds
	 */
	delay = 0,

	/**
	 * Animation direction: normal | reverse | alternate | alternate-reverse
	 * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction
	 */
	direction,

	/**
	 * Animation timing function
	 * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function
	 */
	easing = 'linear',

	/**
	 * Animation duration, in milliseconds
	 */
	duration = 1000,

	/**
	 * Animation fill mode
	 * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
	 */
	fillMode,

	/**
	 * Tag name
	 */
	is: Component = 'div',

	/**
	 * If set, sets CSS animation-play-state="running"
	 * Otherwise, sets CSS animation-play-state="paused"
	 */
	isPlaying = false,

	/**
	 * Animation iteration count
	 * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count
	 */
	iterationCount = 1,

	/**
	 * An animation name (key) passed into the closest ancestor AnimationStore. The
	 * name is provided there and consumed here through a React context Provider/Consumer.
	 */
	name,

	...rest
}) => {
	const { nameToStyleIds } = useContext(AnimationStore.Context);

	const animationName = nameToStyleIds[name];
	if (!animationName) {
		// name not found
		console.warn(`Animation with name could not be found: ${name}`);
		return null;
	}

	return (
		<Component
			{...rest}
			style={{
				...rest.style,
				animationName,
				animationFillMode: fillMode,
				animationDirection: direction,
				animationDuration: `${duration}ms`,
				animationDelay: `${delay}ms`,
				animationIterationCount: iterationCount,
				animationPlayState: isPlaying ? 'running' : 'paused',
				animationTimingFunction: easing
			}}
		>
			{children}
		</Component>
	);
};

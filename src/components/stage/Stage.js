import { React, cx } from 'common';
import { roundToInterval, startDrag, PlaybackController } from 'utils';
import { Box } from 'pu2';

import { AnimationStore, UIStore, StageStore } from 'stores';
import { Canvas, Hover } from 'components/shared';
import Controls from './components/Controls';

import { getStyleProp } from 'utils/cc/styleProps';
import AnimationController from 'utils/AnimationController';

const GRID_COLOR = '#f2f2f2';
const AXIS_COLOR = '#d2d2d2';

const StageCanvas = () => {
	const { gridSize, showGrid, offset, setOffset } = StageStore.use();

	return (
		<Canvas
			onMouseDown={(e) => {
				const { x, y } = offset;
				startDrag(e, {
					distance: 1,
					onDrag: ({ deltaX, deltaY }) => {
						setOffset(x - deltaX, y - deltaY);
					}
				});
			}}
			onFrame={(ctx) => {
				const { width, height } = ctx.canvas;

				ctx.clearRect(0, 0, width, height);
				if (!showGrid) return;

				ctx.save();
				{
					ctx.translate(-offset.x, -offset.y);

					ctx.fillStyle = GRID_COLOR;

					// vertical lines
					const endX = Math.ceil((offset.x + width) / gridSize);
					let x = Math.ceil(offset.x / gridSize);
					while (x < endX) {
						if (x !== 0) ctx.fillRect(x * gridSize - 1, offset.y, 1, height);
						++x;
					}

					// horizontal lines
					const endY = Math.ceil((offset.y + height) / gridSize);
					let y = Math.ceil(offset.y / gridSize);
					while (y < endY) {
						if (y !== 0) ctx.fillRect(offset.x, y * gridSize - 1, width, 1);
						++y;
					}

					// draw axis
					ctx.fillStyle = AXIS_COLOR;
					ctx.fillRect(-1, offset.y, 1, height);
					ctx.fillRect(offset.x, -1, width, 1);
				}
				ctx.restore();
			}}
		/>
	);
};

const Instance = ({ instance }) => {
	const [isDragging, setDragging] = React.useState(false);

	const {
		getKeyframes,
		getTweens,
		getInstanceDefinitionValue,
		setInstanceDefinitionValue
	} = AnimationStore.use();
	const { animationCursor, isInstanceHidden, setSelectedInstance } = UIStore.use();
	const { playhead } = PlaybackController.use();
	const { showGrid, gridSize, gridSnap } = StageStore.use();

	// is instance hidden?
	if (isInstanceHidden(instance.id)) return null;

	const delay = getInstanceDefinitionValue(instance.id, 'animationDelay');
	const duration = getInstanceDefinitionValue(instance.id, 'animationDuration');
	const easing = getInstanceDefinitionValue(instance.id, 'animationTimingFunction');

	// Use cursor time if it's active. Otherwise, use global playhead
	const time = animationCursor.isActive ? delay + duration * animationCursor.ratio : playhead;

	return (
		<Hover>
			{({ hoverRef, isHovering }) => (
				<AnimationController
					format={true}
					delay={delay}
					duration={duration}
					easing={easing}
					keyframes={getTweens(instance.animationId).reduce((map, tween) => {
						map[tween.definitionId] = getKeyframes(tween.id);
						return map;
					}, {})}
					time={time}
				>
					{(interpolatedStyles) => (
						<Box
							ref={hoverRef}
							position="relative"
							cursor={isDragging ? 'grabbing' : 'grab'}
							onMouseDown={(e) => {
								if (e.button !== 0) return;

								setSelectedInstance(instance.id);

								const initX = getInstanceDefinitionValue(instance.id, 'left') || 0;
								const initY = getInstanceDefinitionValue(instance.id, 'top') || 0;

								startDrag(e, {
									onDragStart: () => setDragging(true),
									onDrag: ({ deltaX, deltaY }) => {
										let x = initX + deltaX;
										let y = initY + deltaY;
										if (showGrid && gridSnap) {
											x = roundToInterval(x, gridSize);
											y = roundToInterval(y, gridSize);
										}
										setInstanceDefinitionValue(instance.id, 'left', x);
										setInstanceDefinitionValue(instance.id, 'top', y);
									},
									onDragEnd: () => setDragging(false)
								});
							}}
							style={{
								...Object.keys(instance.definitionValues).reduce((style, definitionId) => {
									const definition = getStyleProp(definitionId);
									const value = instance.definitionValues[definitionId];
									style[definition.styleName] = definition.format(value);
									return style;
								}, {}),

								...interpolatedStyles
							}}
						>
							{isHovering && (
								<Box
									position="absolute"
									right="100%"
									bottom="100%"
									fontSize="10px" /* $font-size-xs */
								>
									{instance.name}
								</Box>
							)}
						</Box>
					)}
				</AnimationController>
			)}
		</Hover>
	);
};

export default () => {
	const { getInstances } = AnimationStore.use();
	const { offset } = StageStore.use();

	return (
		<Box backgroundColor="white" /* $color-bg-0 */ flex="1" position="relative" overflow="hidden">
			<StageCanvas />
			<Box position="absolute" style={{ left: -offset.x, top: -offset.y }}>
				{getInstances().map((instance) => (
					<Instance key={instance.id} instance={instance} />
				))}
			</Box>
			<Controls />
		</Box>
	);
};

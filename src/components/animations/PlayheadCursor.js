import React from 'react';
import isNumber from 'lodash/isNumber';
import { startDrag, PlaybackController } from 'utils';
import { AnimationStore, UIStore } from 'stores';
import { Canvas } from 'components/shared';
import { Box } from 'pu2';

import CursorTime from './CursorTime';

const TWEEN_HEIGHT_PX = 33;

const drawLine = (ctx, x, lineWidth, color) => {
	ctx.fillStyle = color;
	ctx.fillRect(x - Math.floor(lineWidth / 2), 0, lineWidth, ctx.canvas.height);
};

const PlayheadCursor = ({ animation }) => {
	const [isDraggingLocalPlayhead, setDraggingLocalPlayhead] = React.useState(false);

	const { cursorTime, setCursorTime } = CursorTime.use();
	const { getTweens, getInstances, getInstanceDefinitionValue } = AnimationStore.use();
	const { selectedInstanceId } = UIStore.use();

	const { isPlaying, playhead } = PlaybackController.use();

	const instances = getInstances((i) => i.animationId === animation.id);
	const isInstanceSelected = !!selectedInstanceId;

	return (
		<Box
			position="absolute"
			left="0px"
			width="100%"
			top="100%"
			zIndex="1" // allow dragging
			onMouseDown={(e) => {
				startDrag(e, {
					distance: 0,
					measureTarget: e.currentTarget,
					onDragStart: ({ ratioX }) => {
						setDraggingLocalPlayhead(true);
						setCursorTime(ratioX, true);
					},
					onDrag: ({ ratioX }) => {
						setCursorTime(ratioX, true);
					},
					onDragEnd: ({ ratioX }) => {
						setCursorTime(ratioX, false);
						setDraggingLocalPlayhead(false);
					}
				});
			}}
		>
			<Box height={`${getTweens(animation.id).length * TWEEN_HEIGHT_PX}px`}>
				<Canvas
					onFrame={(ctx) => {
						const { width, height } = ctx.canvas;
						ctx.clearRect(0, 0, width, height);

						if (!isPlaying && !isInstanceSelected && isNumber(cursorTime)) {
							const x = Math.floor(cursorTime * width);
							const lineWidth = isDraggingLocalPlayhead ? 5 : 3;
							drawLine(ctx, x, lineWidth, 'dodgerblue');
						}

						instances.forEach((instance) => {
							const delay = getInstanceDefinitionValue(instance.id, 'animationDelay');
							if (playhead < delay) return;

							const duration = getInstanceDefinitionValue(instance.id, 'animationDuration');
							if (playhead >= delay + duration) return;

							const x = Math.floor(((playhead - delay) / duration) * width);
							const lineWidth = selectedInstanceId === instance.id || isPlaying ? 3 : 1;
							drawLine(ctx, x, lineWidth, 'black');
						});
					}}
				/>
			</Box>
		</Box>
	);
};
export default PlayheadCursor;

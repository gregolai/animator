import { React } from 'common';
import { startDrag, PlaybackController } from 'utils';
import { UIStore } from 'stores';
import { Box } from 'pu2';

import { pixelsToTime, timeToPixels } from './utils';
import styles from './PlayheadCursor.module.css';

const PlayheadCursor = () => {
	const { tickSpacing } = UIStore.use();
	const { duration, playhead, setPlayhead } = PlaybackController.use();

	const width = timeToPixels(duration, tickSpacing);
	const left = timeToPixels(playhead, tickSpacing);

	return (
		<Box
			style={{ width }}
			className={styles.container}
			onMouseDown={(e) => {
				startDrag(e, {
					measureTarget: e.currentTarget,
					onDrag: ({ localX }) => {
						setPlayhead(pixelsToTime(localX, tickSpacing));
					}
				});
			}}
			position="absolute"
			right="0px"
			top="0px"
			height="100%"
			zIndex="1"
		>
			<Box
				position="absolute"
				top="0px"
				width="1px"
				height="100%"
				backgroundColor="black"
				style={{ left }}
			/>
		</Box>
	);
};

export default PlayheadCursor;

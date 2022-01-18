import React from 'react';
import { PlaybackController } from 'utils';
import { ButtonField, BooleanField } from 'components/core';
import { Box } from 'pu2';

// PLAY PAUSE CONTROLS
const MediaControls = () => {
	const {
		duration,
		isPlaying,
		playhead,
		setPlaying,
		setPaused,
		setStopped,
		isLooping,
		setLooping,
		isReversed,
		setReversed
	} = PlaybackController.use();

	return (
		<Box display="flex" alignItems="center" p="11px">
			{/* PLAY / PAUSE */}
			<Box flex="1">
				<ButtonField
					isDisabled={playhead === duration}
					label={playhead === duration || isPlaying ? 'Pause' : 'Play'}
					onClick={isPlaying ? setPaused : setPlaying}
				/>
			</Box>

			{/* RESET */}
			<Box flex="1">
				<ButtonField isDisabled={playhead === 0} label="Reset" onClick={setStopped} />
			</Box>

			<BooleanField label="Loop" onChange={setLooping} value={isLooping} />
			<BooleanField label="Reverse" onChange={setReversed} value={isReversed} />
		</Box>
	);
};

export default MediaControls;

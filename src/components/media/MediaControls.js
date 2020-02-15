import { React } from 'common';
import { PlaybackController } from 'utils';
import { ButtonField, BooleanField } from 'components/core';

import styles from './MediaControls.module.scss';

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
    <div className={styles.container}>
      {/* PLAY / PAUSE */}
      <div style={{ flex: 1 }}>
        <ButtonField
          inverted
          size="small"
          isDisabled={playhead === duration}
          label={playhead === duration || isPlaying ? 'Pause' : 'Play'}
          onClick={isPlaying ? setPaused : setPlaying}
        />
      </div>

      {/* RESET */}
      <div style={{ flex: 1 }}>
        <ButtonField
          inverted
          size="small"
          isDisabled={playhead === 0}
          label="Reset"
          onClick={setStopped}
        />
      </div>

      <BooleanField
        className={styles.loop}
        label="Loop"
        onChange={setLooping}
        value={isLooping}
        underlined={false}
      />
      <BooleanField
        className={styles.reverse}
        label="Reverse"
        onChange={setReversed}
        value={isReversed}
        underlined={false}
      />
    </div>
  );
};

export default MediaControls;

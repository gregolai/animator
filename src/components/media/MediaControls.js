import React from 'react';
import classnames from 'classnames';

import { ButtonField, BooleanField } from 'components/core';

import PlaybackController from 'utils/PlaybackController';

import styles from './MediaControls.module.scss';

// PLAY PAUSE CONTROLS
const MediaControls = ({ className }) => {

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
    <div className={classnames(styles.container, className)}>
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

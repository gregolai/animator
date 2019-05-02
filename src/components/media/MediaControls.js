import React from 'react';
import classnames from 'classnames';

import { ButtonField, BooleanField, NumberField } from 'components/core';

import { MediaStore } from 'stores';

import styles from './MediaControls.module.scss';

const MIN_DURATION_MS = 100;
const MAX_DURATION_MS = 10000;

// PLAY PAUSE CONTROLS
const MediaControls = ({ className }) => (
  <MediaStore.Consumer>
    {({
      duration,
      isLooping,
      isReversed,
      isPlaying,
      playhead,
      setDuration,
      setLooping,
      setReversed,
      setPaused,
      setPlaying,
      setStopped
    }) => (
      <div className={classnames(styles.container, className)}>
        <div className={styles.top}>
          <ButtonField
            inverted
            className={styles.play}
            size="small"
            isDisabled={isPlaying}
            label="Play"
            onClick={setPlaying}
          />
          <ButtonField
            inverted
            className={styles.pause}
            size="small"
            isDisabled={!isPlaying}
            label="Pause"
            onClick={setPaused}
          />
          <ButtonField
            inverted
            className={styles.stop}
            size="small"
            isDisabled={playhead === 0}
            label="Stop"
            onClick={setStopped}
          />
        </div>

        <div className={styles.bottom}>
          <NumberField
            className={styles.duration}
            underlined={false}
            label="Duration"
            min={MIN_DURATION_MS}
            max={MAX_DURATION_MS}
            onChange={setDuration}
            value={duration}
          />
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
      </div>
    )}
  </MediaStore.Consumer>
);

export default MediaControls;

import React from 'react';
import classnames from 'classnames';

import { ButtonField, BooleanField } from 'components/core';

import { UIStore } from 'stores';

import styles from './MediaControls.module.scss';

// PLAY PAUSE CONTROLS
const MediaControls = ({ className }) => (
  <UIStore.Consumer>
    {({
      isLooping,
      isReversed,
      isPlaying,
      playhead,
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
  </UIStore.Consumer>
);

export default MediaControls;

import React from 'react';
import classnames from 'classnames';

import { ButtonField, BooleanField, NumberField } from 'components/core';

import { MediaStore } from 'stores';

import styles from './MediaControls.scss';

const GRID_PX = 11;

const MIN_DURATION_MS = 100;
const MAX_DURATION_MS = 10000;

// PLAY PAUSE CONTROLS
const MediaControls = ({ className }) => (
  <MediaStore.Consumer>
    {({ duration, isLooping, isReversed, isPlaying, playhead, setDuration, setLooping, setReversed, setPaused, setPlaying, setStopped }) => (
      <div className={classnames(styles.container, className)}>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <ButtonField
              inverted
              size="small"
              isDisabled={isPlaying}
              label="Play"
              onClick={setPlaying}
            />
          </div>
          <div style={{ flex: 1 }}>
            <ButtonField
              inverted
              size="small"
              isDisabled={!isPlaying}
              label="Pause"
              onClick={setPaused}
            />
          </div>
          <div style={{ flex: 1 }}>
            <ButtonField
              inverted
              size="small"
              isDisabled={playhead === 0}
              label="Stop"
              onClick={setStopped}
            />
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, marginRight: GRID_PX }}>
            <NumberField
              underlined={false}
              label="Duration"
              min={MIN_DURATION_MS}
              max={MAX_DURATION_MS}
              onChange={setDuration}
              value={duration}
            />
          </div>

          <div style={{ flex: 1, marginRight: GRID_PX }}>
            <BooleanField
              label="Loop"
              onChange={setLooping}
              value={isLooping}
              underlined={false}
            />
          </div>
          <div style={{ flex: 1 }}>
            <BooleanField
              label="Reverse"
              onChange={setReversed}
              value={isReversed}
              underlined={false}
            />
          </div>
        </div>
      </div>
    )}
  </MediaStore.Consumer>
)

export default MediaControls;
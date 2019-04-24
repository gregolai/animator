import React from 'react';
import classnames from 'classnames';

import { TIME_STEP_SECONDS } from '../../utils/time';

import { MediaStore } from 'stores';

import styles from './Playhead.scss';

const Playhead = ({ className }) => (
  <MediaStore.Consumer>
    {({ playhead, setPlayhead }) => (
      <div className={classnames(styles.container, className)}>
        <div className={styles.timeDisplay}>{playhead}</div>
        <input
          className={styles.slider}
          min={0}
          max={1}
          onChange={e => setPlayhead(parseFloat(e.target.value))}
          step={TIME_STEP_SECONDS}
          type="range"
          value={playhead}
        />
      </div>
    )}
  </MediaStore.Consumer>
)

export default Playhead;
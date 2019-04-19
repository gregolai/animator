import React from 'react';
import classnames from 'classnames';
import MediaStore from '../../../stores/MediaStore';

import styles from './PlayheadCursor.scss';

const PlayheadCursor = ({ className }) => (
  <MediaStore.Consumer>
    {({ playhead }) => (
      <div className={classnames(styles.container, className)}>
        <div
          className={styles.playhead}
          style={{ left: `${playhead * 100}%` }}
        >
          <div className={styles.diamond} style={{ top: '0px' }} />
          <div className={styles.diamond} style={{ top: '100%' }} />
        </div>
      </div>
    )}
  </MediaStore.Consumer>
)

export default PlayheadCursor;
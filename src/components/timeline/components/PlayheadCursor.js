import React from 'react';
import classnames from 'classnames';
import { MediaStore } from 'stores';
import { INTERVAL_MS } from 'utils/constants';

import styles from './PlayheadCursor.scss';

const PlayheadCursor = ({ className }) => (
  <MediaStore.Consumer>
    {({ playhead, tickSpacing }) => (
      <div className={classnames(styles.container, className)}>
        <div
          className={styles.playhead}
          style={{ left: `${playhead / INTERVAL_MS * tickSpacing}px` }}
        >
          <div className={styles.diamond} style={{ top: '0px' }} />
          <div className={styles.diamond} style={{ top: '100%' }} />
        </div>
      </div>
    )}
  </MediaStore.Consumer>
)

export default PlayheadCursor;
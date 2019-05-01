import { React, cx } from 'utils';

import { MediaStore } from 'stores';
// import { Canvas } from 'components/shared';
import { startDrag } from 'utils/mouse';

import { pixelsToTime, timeToPixels } from './utils';
import styles from './PlayheadCursor.module.scss';

const PlayheadCursor = ({ className }) => {
  return (
    <MediaStore.Consumer>
      {({ tickSpacing, playhead, setPlayhead }) => (
        <div
          className={cx(styles.container, className)}
          onMouseDown={e => {
            startDrag(e, {
              onDrag: ({ x }) => setPlayhead(pixelsToTime(x, 4))
            })
          }}
        >
          <div
            className={styles.cursor}
            style={{ left: timeToPixels(playhead, tickSpacing) }}
          />
        </div>
      )}
    </MediaStore.Consumer>
  )
}

export default PlayheadCursor;
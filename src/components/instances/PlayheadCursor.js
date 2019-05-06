import { React, cx, startDrag } from 'common';

import { UIStore } from 'stores';

import { pixelsToTime, timeToPixels } from './utils';
import styles from './PlayheadCursor.module.scss';

const PlayheadCursor = ({ className }) => {
  return (
    <UIStore.Consumer>
      {({ tickSpacing, playhead, setPlayhead }) => (
        <div
          className={cx(styles.container, className)}
          onMouseDown={e => {
            const onDrag = ({ localX }) => setPlayhead(pixelsToTime(localX, tickSpacing));
            startDrag(e, {
              distance: 0,
              measureTarget: e.target,
              onDragStart: onDrag,
              onDrag
            });
          }}
        >
          <div className={styles.cursor} style={{ left: timeToPixels(playhead, tickSpacing) }} />
        </div>
      )}
    </UIStore.Consumer>
  );
};

export default PlayheadCursor;

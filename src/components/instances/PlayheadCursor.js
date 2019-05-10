import { React, cx, startDrag } from 'common';

import { UIStore } from 'stores';
import PlaybackController from 'utils/PlaybackController';

import { pixelsToTime, timeToPixels } from './utils';
import styles from './PlayheadCursor.module.scss';

const PlayheadCursor = ({ className }) => {
  const { tickSpacing } = UIStore.use();
  const { duration, playhead, setPlayhead } = PlaybackController.use();

  const width = timeToPixels(duration, tickSpacing);
  const left = timeToPixels(playhead, tickSpacing);

  return (
    <div
      style={{ width }}
      className={cx(styles.container, className)}
      onMouseDown={e => {
        startDrag(e, {
          measureTarget: e.currentTarget,
          onDrag: ({ localX }) => {
            setPlayhead(pixelsToTime(localX, tickSpacing));
          }
        });
      }}
    >
      <div className={styles.cursor} style={{ left }} />
    </div>
  );
};

export default PlayheadCursor;

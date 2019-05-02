import React from 'react';
import classnames from 'classnames';

import { IconButton, Ticks } from 'components/shared';
import { MediaStore } from 'stores';
import { INTERVAL_MS } from 'utils/constants';

import styles from './Playhead.module.scss';

const Playhead = ({ className }) => {
  return (
    <MediaStore.Consumer>
      {({ duration, playhead, setPlayhead, setTickSpacing, tickSpacing }) => (
        <div className={classnames(styles.container, className)}>
          <div className={styles.left}>
            <div className={styles.tickSpacingButtons}>
              <IconButton icon="chevronLeft" onClick={() => setTickSpacing(tickSpacing - 1)} />
              <IconButton icon="chevronRight" onClick={() => setTickSpacing(tickSpacing + 1)} />
            </div>

            <div>spacing: {tickSpacing}</div>

            <div className={styles.timeDisplay}>{playhead}</div>
          </div>

          <div className={styles.right}>
            <Ticks.EvenSpaced
              count={100}
              ticks={[
                {
                  mod: 10,
                  height: 12,
                  color: '#a1a1a1',
                  drawExtra: ({ ctx, index, x, y }) => {
                    ctx.font = '12px "Helvetica Neue", sans-serif';
                    const text = `${index}%`;
                    const measured = ctx.measureText(text);
                    ctx.fillText(text, x - measured.width / 2, y - 4);
                  }
                },
                { mod: 5, height: 8, color: '#a1a1a1' },
                { mod: 1, height: 4, color: '#a1a1a1' }
              ]}
              onMouseDown={({ x, y }) => {
                setPlayhead((x / tickSpacing) * INTERVAL_MS);
              }}
              onMouseMove={({ isButtonDown, x, y }) => {
                if (isButtonDown) {
                  setPlayhead((x / tickSpacing) * INTERVAL_MS);
                }
              }}
            />
          </div>
        </div>
      )}
    </MediaStore.Consumer>
  );
};

export default Playhead;

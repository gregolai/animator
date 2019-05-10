import { React, cx } from 'common';

import { UIStore } from 'stores';
import { Ticks } from 'components/shared';

import styles from './PlayheadTimeline.module.scss';

const PlayheadTimeline = ({ className }) => {
  const { tickSpacing } = UIStore.use();
  return (
    <div className={cx(styles.container, className)}>
      <Ticks.PixelSpaced
        spacing={tickSpacing}
        ticks={[
          {
            mod: 20,
            height: 20,
            color: '#a1a1a1',
            drawExtra: ({ ctx, index, x, y }) => {
              ctx.font = '12px "Helvetica Neue", sans-serif';
              const text = `${index / 100}s`;
              const measured = ctx.measureText(text);
              ctx.fillStyle = 'black';
              ctx.fillText(text, x - measured.width / 2, y - 4);
            }
          },
          { mod: 10, color: '#a1a1a1', height: 10 },
          { mod: 1, color: '#a1a1a1', height: 5 }
        ]}
      />
    </div>
  );
};
export default PlayheadTimeline;

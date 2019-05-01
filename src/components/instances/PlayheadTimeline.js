import { React, cx } from 'utils';

import { AnimationStore } from 'stores';
import { Ticks } from 'components/shared';
import { INTERVAL_MS } from 'utils/constants';

import styles from './PlayheadTimeline.module.scss';

const PlayheadTimeline = ({ className, spacing, duration }) => {
  return (
    <div className={cx(styles.container, className)}>
      <AnimationStore.Consumer>
        {({ getInstances, getInstanceDefinitionValue }) => {

          const maxDuration = getInstances().reduce((max, instance) => {
            const delay = getInstanceDefinitionValue(instance.id, 'animation-delay')
            const duration = getInstanceDefinitionValue(instance.id, 'animation-duration');
            return Math.max(max, duration + delay);
          }, 0);
          if (maxDuration === 0) return null;

          console.log('maxDuration:', maxDuration);

          return (
            <Ticks.PixelSpaced
              max={maxDuration / INTERVAL_MS}
              spacing={spacing}
              ticks={[
                {
                  mod: 20,
                  height: 20,
                  drawExtra: ({ ctx, index, x, y }) => {
                    ctx.font = '12px "Helvetica Neue", sans-serif';
                    const text = `${index / 100}s`;
                    const measured = ctx.measureText(text);
                    ctx.fillText(text, x - (measured.width / 2), y - 4);
                  }
                },
                { mod: 10, height: 10 },
                { mod: 1, height: 5 }
              ]}
            />
          );
        }}
      </AnimationStore.Consumer>
    </div>
  )
}
export default PlayheadTimeline;
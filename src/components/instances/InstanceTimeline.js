import { React, cx } from 'utils';
import { AnimationStore, MediaStore } from 'stores';
import { Canvas } from 'components/shared';

import { timeToPixels } from './utils';
import styles from './InstanceTimeline.module.scss';

const DELAY_COLOR = '#a1a1a1';
const DURATION_COLOR = '#d2d2d2';

const InstanceTimeline = ({ className, instance }) => {
  return (
    <div className={cx(styles.container, className)}>
      <MediaStore.Consumer>
        {({ tickSpacing }) => (
          <AnimationStore.Consumer>
            {({ getInstanceDefinitionValue }) => {
              const delay = getInstanceDefinitionValue(instance.id, 'animation-delay');
              const duration = getInstanceDefinitionValue(instance.id, 'animation-duration');

              return (
                <Canvas
                  onResize={({ cvs, ctx }) => {
                    const { width, height } = cvs;
                    ctx.clearRect(0, 0, width, height);

                    if (delay > 0) {
                      const width = timeToPixels(delay, tickSpacing);
                      ctx.fillStyle = DELAY_COLOR;
                      ctx.fillRect(0, 0, width, height);
                    }

                    {
                      const x = timeToPixels(delay, tickSpacing);
                      const width = timeToPixels(duration, tickSpacing);
                      ctx.fillStyle = DURATION_COLOR;
                      ctx.fillRect(x, 0, width, height);
                    }
                  }}
                />
              )
            }}
          </AnimationStore.Consumer>
        )}
      </MediaStore.Consumer>
    </div>
  )
}

export default InstanceTimeline;
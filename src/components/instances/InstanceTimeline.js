import { React, cx } from 'common';
import { AnimationStore, UIStore } from 'stores';
import { Canvas } from 'components/shared';

import { timeToPixels } from './utils';
import styles from './InstanceTimeline.module.scss';

const DELAY_COLOR = '#a1a1a1';
const DURATION_COLOR = '#d2d2d2';

const InstanceTimeline = ({ className, instance }) => {
  return (
    <div className={cx(styles.container, className)}>
      <UIStore.Consumer>
        {({ tickSpacing }) => (
          <AnimationStore.Consumer>
            {({ getTweens, getKeyframes, getInstanceDefinitionValue }) => {
              const delay = getInstanceDefinitionValue(instance.id, 'animation-delay');
              const duration = getInstanceDefinitionValue(instance.id, 'animation-duration');

              return (
                <Canvas
                  onResize={({ cvs, ctx }) => {
                    const { width, height } = cvs;
                    ctx.clearRect(0, 0, width, height);

                    const pxDelay = timeToPixels(delay, tickSpacing);
                    const pxDuration = timeToPixels(duration, tickSpacing);

                    // delay bar
                    if (delay > 0) {
                      ctx.fillStyle = DELAY_COLOR;
                      ctx.fillRect(0, 0, pxDelay, height);
                    }

                    // duration bar
                    ctx.fillStyle = DURATION_COLOR;
                    ctx.fillRect(pxDelay, 0, pxDuration, height);

                    // render tween bars
                    getTweens(instance.animationId).forEach((tween, tweenIndex, tweens) => {

                      const keyframes = getKeyframes(tween.id);
                      const y = Math.round((tweenIndex + 1) * (height / (tweens.length + 1)));

                      let x0, x1;
                      for (let i = 0; i < keyframes.length - 1; ++i) {
                        x0 = pxDelay + Math.floor(keyframes[i].time * pxDuration);
                        x1 = pxDelay + Math.floor(keyframes[i + 1].time * pxDuration);

                        ctx.fillStyle = 'black';
                        ctx.fillRect(x0, y, x1 - x0, 2);

                        // draw keyframe
                        ctx.fillRect(x0 - 2, y - 2, 6, 6);
                      }

                      // draw last keyframe
                      ctx.fillRect(x1 - 2, y - 2, 6, 6);
                    })
                  }}
                />
              );
            }}
          </AnimationStore.Consumer>
        )}
      </UIStore.Consumer>
    </div>
  );
};

export default InstanceTimeline;

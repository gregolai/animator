import { React, cx } from 'utils';

import { AnimationStore, MediaStore } from 'stores';
import { Canvas } from 'components/shared';
import { TWEEN_HEIGHT_PX } from 'utils/constants';

import styles from './PlayheadCursor.module.scss';

const Inner = ({ color, height, instances }) => (
  <div style={{ height }}>
    <AnimationStore.Consumer>
      {({ getInstanceDefinitionValue }) => (
        <MediaStore.Consumer>
          {({ playhead }) => (
            <Canvas
              onResize={({ cvs, ctx }) => {
                const { width, height } = cvs;
                ctx.clearRect(0, 0, width, height);

                instances.forEach(instance => {
                  const delay = getInstanceDefinitionValue(instance.id, 'animation-delay');
                  if (playhead < delay) return;

                  const duration = getInstanceDefinitionValue(instance.id, 'animation-duration');
                  if (playhead >= delay + duration) return;

                  const left = Math.floor((playhead - delay) / duration * cvs.width);

                  ctx.fillStyle = color;
                  ctx.fillRect(left, 0, 1, cvs.height);
                })
              }}
            />
          )}
        </MediaStore.Consumer>
      )}
    </AnimationStore.Consumer>
  </div>
)


const PlayheadCursor = ({ animation, className, color = 'black' }) => {

  return (
    <div className={cx(styles.container, className)}>
      <AnimationStore.Consumer>
        {({ getInstances, getTweens }) => {
          const tweenCount = getTweens(animation.id).length;
          if (tweenCount === 0) return null;

          const instances = getInstances(i => i.animId === animation.id);
          return (
            <Inner
              color={color}
              height={tweenCount * TWEEN_HEIGHT_PX}
              instances={instances}
            />
          );
        }}
      </AnimationStore.Consumer>
    </div>
  )
}

export default PlayheadCursor;
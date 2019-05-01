import { React, cx } from 'utils';

import { AnimationStore, UIStore } from 'stores';
import { AddDropdown, Canvas } from 'components/shared';
import { INTERVAL_MS } from 'utils/constants';

import PlayheadCursor from './PlayheadCursor';
import PlayheadTimeline from './PlayheadTimeline';

import styles from './Instances.module.scss';

const InstanceControls = ({ instance }) => {
  return (
    <div className={styles.controls}>{instance.name} controls</div>
  )
}

const calculateTimelinePixels = (milliseconds, spacing) => {
  return Math.floor(milliseconds * SPACING / INTERVAL_MS);
}

const SPACING = 4;
const TEST_DURATION = 4000;

const InstanceTimeline = ({ instance }) => {

  return (
    <div className={styles.timeline}>
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
                  const width = calculateTimelinePixels(delay, SPACING);
                  ctx.fillStyle = '#a1a1a1';
                  ctx.fillRect(0, 0, width, height);
                }

                {
                  const x = calculateTimelinePixels(delay, SPACING);
                  const width = calculateTimelinePixels(duration, SPACING);
                  ctx.fillStyle = '#d2d2d2';
                  ctx.fillRect(x, 0, width, height);
                }
              }}
            />
          )
        }}
      </AnimationStore.Consumer>
    </div>
  )

}

const Instance = ({ instance }) => {
  return (
    <div className={styles.instance}>
      <InstanceControls instance={instance} />
      <InstanceTimeline instance={instance} />
    </div>
  );
}

const HeadLeft = () => {
  return (
    <div className={styles.left}>
      <AnimationStore.Consumer>
        {({ getAnimations, createInstance }) => (
          <UIStore.Consumer>
            {({ setSelectedInstance }) => (
              <AddDropdown
                label="Create Instance"
                options={
                  getAnimations().map(animation => ({
                    label: animation.name,
                    value: animation.id
                  }))
                }
                onSelect={animId => {
                  const instance = createInstance({ animId });
                  setSelectedInstance(instance.id);
                }}
              />
            )}
          </UIStore.Consumer>
        )}
      </AnimationStore.Consumer>

    </div>
  )
}

const HeadRight = () => {
  return (
    <div className={styles.right}>
      <PlayheadTimeline spacing={SPACING} duration={TEST_DURATION} />
    </div>
  );
}

const Instances = ({ className }) => {
  return (
    <div className={cx(styles.container, className)}>
      <div className={styles.head}>
        <HeadLeft />
        <HeadRight />
      </div>
      <div className={styles.body}>
        <AnimationStore.Consumer>
          {({ getInstances }) => getInstances().map(instance => <Instance key={instance.id} instance={instance} />)}
        </AnimationStore.Consumer>

        <div style={{ position: 'absolute', left: 420, right: 0, top: 0, height: '100%' }}>
          <PlayheadCursor />
        </div>
      </div>
    </div>
  )
}
export default Instances;

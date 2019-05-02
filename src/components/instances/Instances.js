import { React, cx } from 'utils';

import { AnimationStore, MediaStore, UIStore } from 'stores';
import { StepperField } from 'components/core';
import { AddDropdown } from 'components/shared';

import InstanceControls from './InstanceControls';
import InstanceTimeline from './InstanceTimeline';
import PlayheadCursor from './PlayheadCursor';
import PlayheadTimeline from './PlayheadTimeline';

import styles from './Instances.module.scss';


const Instance = ({ instance }) => {
  return (
    <div className={styles.instance}>
      <InstanceControls instance={instance} />
      <InstanceTimeline className={styles.timeline} instance={instance} />
    </div>
  );
}

const HeadLeft = () => {
  return (
    <AnimationStore.Consumer>
      {({ getAnimations, createInstance }) => (
        <UIStore.Consumer>
          {({ setSelectedInstance }) => {
            const animations = getAnimations();

            return (
              <div className={styles.left}>
                {animations.length > 0 && (
                  <AddDropdown
                    className={styles.btnCreateInstance}
                    label="Create Instance"
                    options={
                      animations.map(animation => ({
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

                <MediaStore.Consumer>
                  {({ tickSpacing, setTickSpacing }) => (
                    <StepperField
                      flush
                      underlined={false}
                      className={styles.spacing}
                      label="Spacing"
                      min={2}
                      max={20}
                      onChange={setTickSpacing}
                      step={1}
                      value={tickSpacing}
                    />
                  )}
                </MediaStore.Consumer>

              </div>
            );
          }}
        </UIStore.Consumer>
      )}
    </AnimationStore.Consumer>
  )
}

const Instances = ({ className }) => {
  return (
    <div className={cx(styles.container, className)}>
      <div className={styles.head}>
        <HeadLeft />
        <PlayheadTimeline className={styles.right} />
      </div>
      <div className={styles.body}>
        <AnimationStore.Consumer>
          {({ getInstances }) => getInstances().map(instance => <Instance key={instance.id} instance={instance} />)}
        </AnimationStore.Consumer>

        <PlayheadCursor />
      </div>
    </div>
  )
}
export default Instances;

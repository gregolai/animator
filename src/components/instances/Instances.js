import { React, cx } from 'common';

import { AnimationStore, UIStore } from 'stores';
import { StepperField } from 'components/core';
import { AddDropdown } from 'components/shared';

import Controls from './Controls';
import InstanceTimeline from './InstanceTimeline';
import PlayheadCursor from './PlayheadCursor';
import PlayheadTimeline from './PlayheadTimeline';

import styles from './Instances.module.scss';

const Instance = ({ instance }) => {
  return (
    <UIStore.Consumer>
      {({ selectedInstanceId }) => {

        const isSelected = selectedInstanceId === instance.id;
        return (
          <div
            className={cx(styles.instance, {
              [styles.selected]: isSelected
            })}
          >
            <Controls className={styles.controls} instance={instance} />
            <InstanceTimeline className={styles.timeline} instance={instance} />
          </div>
        );
      }}
    </UIStore.Consumer>
  );
};

const HeadLeft = () => {
  return (
    <AnimationStore.Consumer>
      {({ getAnimations, createInstance }) => (
        <UIStore.Consumer>
          {({ setSelectedInstance, tickSpacing, setTickSpacing }) => {
            const animations = getAnimations();

            return (
              <div className={styles.left}>
                {animations.length > 0 && (
                  <AddDropdown
                    className={styles.btnCreateInstance}
                    label="Create Instance"
                    options={animations.map(animation => ({
                      label: animation.name,
                      value: animation.id
                    }))}
                    onSelect={animationId => {
                      const instance = createInstance({ animationId });
                      setSelectedInstance(instance.id);
                    }}
                  />
                )}

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
              </div>
            );
          }}
        </UIStore.Consumer>
      )}
    </AnimationStore.Consumer>
  );
};

const Instances = ({ className }) => {
  return (
    <div className={cx(styles.container, className)}>
      <div className={styles.head}>
        <HeadLeft />
        <PlayheadTimeline className={styles.right} />
      </div>
      <div className={styles.body}>
        <AnimationStore.Consumer>
          {({ getInstances }) =>
            getInstances().map(instance => <Instance key={instance.id} instance={instance} />)
          }
        </AnimationStore.Consumer>

        <PlayheadCursor />
      </div>
    </div>
  );
};
export default Instances;

import { React, cx } from 'common';

import { AnimationStore, UIStore } from 'stores';
import Animation from './Animation';

import styles from './Animations.module.scss';

const Animations = ({ className }) => {
  return (
    <UIStore.Consumer>
      {({ selectedInstanceId }) => (

        <div
          className={cx(styles.container, {
            [styles.instanceFocused]: selectedInstanceId !== -1
          }, className)}
        >
          <AnimationStore.Consumer>
            {({ getAnimations }) =>
              getAnimations().map(animation => <Animation key={animation.id} animation={animation} />)
            }
          </AnimationStore.Consumer>
        </div>
      )}
    </UIStore.Consumer>
  );
};
export default Animations;

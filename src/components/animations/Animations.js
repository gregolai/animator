import { React, cx } from 'common';

import { AnimationStore, UIStore } from 'stores';
import Animation from './Animation';

import styles from './Animations.module.scss';

const Animations = ({ className }) => {
  const { getAnimations } = AnimationStore.use();
  const { selectedInstanceId } = UIStore.use();
  return (
    <div
      className={cx(styles.container, {
        [styles.instanceFocused]: selectedInstanceId !== -1
      }, className)}
    >
      {getAnimations().map(animation => <Animation key={animation.id} animation={animation} />)}
    </div>
  );
};
export default Animations;

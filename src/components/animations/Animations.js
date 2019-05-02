import { React, cx } from 'utils';

import { AnimationStore } from 'stores';
import Animation from './Animation';

import styles from './Animations.module.scss';

const Animations = ({ className }) => {
  return (
    <div className={cx(styles.container, className)}>
      <AnimationStore.Consumer>
        {({ getAnimations }) => getAnimations().map(animation => <Animation key={animation.id} animation={animation} />)}
      </AnimationStore.Consumer>
    </div>
  )
}
export default Animations;
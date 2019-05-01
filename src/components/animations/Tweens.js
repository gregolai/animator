import { React, cx } from 'utils';

import { AnimationStore } from 'stores';
import { TWEEN_HEIGHT_PX } from 'utils/constants';

import TweenControls from './TweenControls';
import TweenTimeline from './TweenTimeline';

import styles from './Tweens.module.scss';

const Tween = ({ tween }) => {
  return (
    <div className={styles.tween} style={{ height: TWEEN_HEIGHT_PX }}>
      <TweenControls tween={tween} />
      <TweenTimeline className={styles.timeline} tween={tween} />
    </div>
  )
}

const Tweens = ({ animation, className }) => {
  return (
    <div className={cx(styles.container, className)}>
      <AnimationStore.Consumer>
        {({ getTweens }) =>
          getTweens(animation.id)
            .map(tween => <Tween key={tween.id} tween={tween} />)
        }
      </AnimationStore.Consumer>
    </div>
  )
}

export default Tweens;
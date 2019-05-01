import { React, cx } from 'utils';

import { TWEEN_HEIGHT_PX } from 'utils/constants';

import TweenControls from './TweenControls';
import TweenTimeline from './TweenTimeline';

import styles from './Tweens.module.scss';

const Tween = ({ tween }) => {
  return (
    <div className={styles.tween} style={{ height: TWEEN_HEIGHT_PX }}>
      <TweenControls tween={tween} />
      <TweenTimeline className={styles.timeline} />
    </div>
  )
}

const Tweens = ({ tweens, className }) => {
  return (
    <div className={cx(styles.container, className)}>
      {tweens.map(tween => <Tween key={tween.id} tween={tween} />)}
    </div>
  )
}

export default Tweens;
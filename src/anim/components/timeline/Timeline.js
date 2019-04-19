import React from 'react';
import classnames from 'classnames';

import AnimationStore from '../../stores/AnimationStore';

import Animation from './components/Animation';
import PlayheadCursor from './components/PlayheadCursor';

import styles from './Timeline.scss';






const Timeline = ({ className }) => (
  <div className={classnames(styles.container, className)}>
    {/* PLAYHEAD VERTICAL LINE */}
    <PlayheadCursor className={styles.playhead} />

    {/* LEFT AREA BACKGROUND */}
    <div className={styles.leftBackground} />

    <div className={styles.scrollContainer}>

      <div className={styles.content}>
        <AnimationStore.Consumer>
          {({ getAnimations }) => (
            getAnimations().map(anim => (
              <Animation
                key={anim.id}
                anim={anim}
              />
            ))
          )}
        </AnimationStore.Consumer>
      </div>
    </div>
  </div>
)

export default Timeline;
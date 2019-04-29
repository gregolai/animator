import React from 'react';
import classnames from 'classnames';

import { AnimationStore } from 'stores';
import { ButtonField } from 'components/core';

import Animation from './components/Animation';
import PlayheadCursor from './components/PlayheadCursor';

import styles from './Timeline.scss';

const Timeline = ({ className }) => (
  <div className={classnames(styles.container, className)}>
    {/* PLAYHEAD VERTICAL LINE */}
    <PlayheadCursor className={styles.playhead} />

    {/* ADD ANIMATION */}
    <AnimationStore.Consumer>
      {({ createAnimation }) => (
        <div className={styles.addAnimation}>
          <ButtonField
            color="primary"
            size="small"
            label="Create Animation"
            onClick={() => createAnimation()}
          />
        </div>
      )}
    </AnimationStore.Consumer>

    <div className={styles.scrollContainer}>

      <div className={styles.content}>
        <AnimationStore.Consumer>
          {({ getAnimations, getInstances }) => (
            getAnimations().map(anim => (
              <div key={anim.id}>
                <Animation
                  //key={anim.id}
                  anim={anim}
                />
                {getInstances(i => i.animId === anim.id).map(instance => {
                  return <div key={instance.id}>{instance.name}</div>;
                })}
              </div>
            ))
          )}
        </AnimationStore.Consumer>
      </div>
    </div>
  </div>
)

export default Timeline;
import React from 'react';
import classnames from 'classnames';

import ValueEditor from 'components/shared/ValueEditor';

import { AnimationStore, UIStore } from 'stores';

import AnimationHead from './AnimationHead';
import TweenTimeline from './TweenTimeline';
import TweenControls from './TweenControls';

import styles from './Animation.scss';

const Animation = ({ className, anim }) => (
  <div className={classnames(styles.container, className)}>
    <AnimationHead anim={anim} />
    <div className={styles.tweens}>
      <AnimationStore.Consumer>
        {({ getTweens }) => (
          getTweens(anim.id).map((tween, tweenIndex) => (
            <div key={tween.id}>
              <div style={{ display: 'flex' }}>
                <TweenControls
                  tween={tween}
                  tweenIndex={tweenIndex}
                />
                <TweenTimeline
                  tween={tween}
                  tweenIndex={tweenIndex}
                />
              </div>

              <UIStore.Consumer>
                {({ isTweenExpanded }) => isTweenExpanded(tween.id) && (
                  <ValueEditor className={styles.valueEditor} tween={tween} />
                )}
              </UIStore.Consumer>

            </div>
          ))
        )}
      </AnimationStore.Consumer>
    </div>
  </div>
);

export default Animation;
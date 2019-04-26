import React from 'react';
import classnames from 'classnames';

import { ContextField, Icon, IconButton } from 'components/core';
import ExpandingTitle from 'components/shared/ExpandingTitle';
import Hover from 'components/shared/Hover';
import ValueEditor from 'components/shared/ValueEditor';

import { AnimationStore, UIStore } from 'stores';

import TweenTimeline from './TweenTimeline';
import TweenControls from './TweenControls';

import styles from './Animation.scss';

// const TweenBar = React.forwardRef(
//   ({ keyframes, onMouseDown }, ref) => keyframes.length && (
//     <div
//       style={{
//         position: 'absolute',
//         top: 0,
//         left: `${keyframes[0].time * 100}%`,
//         right: `${(1 - keyframes[keyframes.length - 1].time) * 100}%`,
//         height: '100%'
//       }}
//       onMouseDown={onMouseDown}
//     >
//       <div
//         ref={ref}
//         style={{ height: '100%', backgroundColor: 'black' }}
//       />
//     </div>
//   )
// );


const DeleteAnimation = ({ onClick, enabled }) => (
  <IconButton
    className={classnames(styles.btnDeleteAnimation, {
      [styles.hidden]: !enabled
    })}
    isDisabled={!enabled}
    onClick={onClick}
  >
    <Icon name="close" />
  </IconButton>
)

const Head = ({ anim }) => (
  <Hover>
    {({ hoverRef, isHovering }) => (
      <UIStore.Consumer>
        {({ isAnimationSelected, setSelectedAnim }) => (
          <AnimationStore.Consumer>
            {({ deleteAnimation }) => (
              <div className={styles.head}>
                <ExpandingTitle
                  ref={hoverRef}
                  className={styles.animTitle}
                  isExpanded={isAnimationSelected(anim.id)}
                  onClick={() => setSelectedAnim(anim.id)}
                  label={anim.name}
                  accessory={
                    <DeleteAnimation
                      enabled={isHovering && isAnimationSelected(anim.id)}
                      onClick={() => {
                        const { animIndex, animations } = deleteAnimation(anim.id);

                        const nextAnim = animations[animIndex] || animations[animIndex - 1];
                        setSelectedAnim(nextAnim ? nextAnim.id : -1);
                      }}
                    />
                  }
                />
              </div>
            )}
          </AnimationStore.Consumer>
        )}
      </UIStore.Consumer>
    )}
  </Hover>
)

const Animation = ({ className, anim }) => (
  <div className={classnames(styles.container, className)}>
    <Head anim={anim} />
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
import React from 'react';
import classnames from 'classnames';
import clamp from 'lodash/clamp';

import { ContextField, Icon, IconButton } from 'components/core';
import Drag from 'components/shared/Drag';
import Hover from 'components/shared/Hover';
import ValueEditor from 'components/shared/ValueEditor';

import { AnimationStore, MediaStore, UIStore } from 'stores';


import TweenControls from './TweenControls';

import styles from './Animation.scss';

const TweenKeyframe = ({ keyframe, isDragging, onMouseDown }) => (
  <MediaStore.Consumer>
    {({ setPlayhead }) => (
      <div
        className={classnames(styles.keyframe, {
          [styles.dragging]: isDragging
        })}
        style={{ left: `${keyframe.time * 100}%` }}
        onClick={() => setPlayhead(keyframe.time)}
        onMouseDown={onMouseDown}
      />
    )}
  </MediaStore.Consumer>
)

const TweenBar = React.forwardRef(
  ({ keyframes, onMouseDown }, ref) => keyframes.length && (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: `${keyframes[0].time * 100}%`,
        right: `${(1 - keyframes[keyframes.length - 1].time) * 100}%`,
        height: '100%'
      }}
      onMouseDown={onMouseDown}
    >
      <div
        ref={ref}
        style={{ height: '100%', backgroundColor: 'black' }}
      />
    </div>
  )
);

class TweenTimeline extends React.Component {
  captureRef = ref => {
    this.containerRef = ref;
  };

  captureBarRef = ref => {
    this.barRef = ref;
  }

  render() {
    const { tween, tweenIndex } = this.props;

    return (
      <div
        ref={this.captureRef}
        className={classnames(styles.tween, {
          [styles.odd]: tweenIndex & 1
        })}>
        <AnimationStore.Consumer>
          {({ getKeyframes }) => {
            const keyframes = getKeyframes(tween.id);
            if (keyframes.length === 0) return null;

            return (
              <>
                {keyframes.length > 1 && (
                  <TweenBar
                    ref={this.captureBarRef}
                    keyframes={keyframes}
                  />
                )}
                {keyframes.map(keyframe => (
                  <AnimationStore.Consumer key={keyframe.id}>
                    {({ setKeyframeTime }) => (
                      <Drag>
                        {({ isDragging, startDrag }) => (
                          <TweenKeyframe
                            key={keyframe.id}
                            keyframe={keyframe}
                            isDragging={isDragging}
                            onMouseDown={event => {
                              if (!this.containerRef) return;
                              if (event.button !== 0) return;

                              const rect = this.containerRef.getBoundingClientRect();

                              startDrag({
                                event,
                                onUpdate: ({ pageX }) => {
                                  const time = clamp((pageX - rect.left) / rect.width, 0, 1);
                                  setKeyframeTime(keyframe.id, time);
                                }
                              })
                            }}
                          />
                        )}
                      </Drag>
                    )}
                  </AnimationStore.Consumer>
                ))}
              </>
            );
          }}
        </AnimationStore.Consumer>
      </div>
    );
  }
}













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
              <div
                ref={hoverRef}
                className={styles.head}
              >
                <DeleteAnimation
                  enabled={isHovering && isAnimationSelected(anim.id)}
                  onClick={() => {
                    const { animIndex, animations } = deleteAnimation(anim.id);

                    const nextAnim = animations[animIndex] || animations[animIndex - 1];
                    setSelectedAnim(nextAnim ? nextAnim.id : -1);
                  }}
                />
                <ContextField
                  className={classnames(styles.animName, {
                    [styles.selected]: isAnimationSelected(anim.id)
                  })}
                  label={anim.name}
                  fieldIndex={0}
                  onClick={() => setSelectedAnim(anim.id)}
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
          getTweens(anim.id).map((tween, tweenIndex, tweens) => (
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
                {({ isTweenLocked, isTweenExpanded }) => !isTweenLocked(tween.id) && isTweenExpanded(tween.id) && (
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
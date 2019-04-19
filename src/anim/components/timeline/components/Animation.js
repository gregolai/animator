import React from 'react';
import classnames from 'classnames';
import clamp from 'lodash/clamp';
import ContextField from '@sqs/core-components/fields/ContextField';
import Icon from '@sqs/core-components/primitives/Icon';
import IconButton from '@sqs/core-components/primitives/IconButton';

import AnimationStore from '../../../stores/AnimationStore';
import UIStore from '../../../stores/UIStore';

import Drag from '../../shared/Drag';
import TweenLabel from './TweenLabel';
import ValueEditor from './ValueEditor';

import styles from './Animation.scss';







const TweenContainer = React.forwardRef(
  ({ children, style }, ref) => (
    <div
      ref={ref}
      style={{
        position: 'relative',
        height: 33,
        backgroundColor: '#f0f0f0',
        ...style
      }}
    >
      {children}
    </div>
  )
);

const TweenKeyframe = ({ keyframe, isDragging, onMouseDown }) => (
  <div
    onMouseDown={onMouseDown}
    style={{
      position: 'absolute',
      top: 0,
      width: 8,
      left: `${keyframe.time * 100}%`,
      height: '100%',
      cursor: 'col-resize',
      backgroundColor: isDragging ? 'red' : 'dodgerblue'
    }}
  ></div>
);

const TweenBar = React.forwardRef(
  ({ children, keyframes, onMouseDown }, ref) => keyframes.length && (
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
      {children}
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

  renderKeyframe(keyframe) {
    return (
      <AnimationStore.Consumer key={keyframe.id}>
        {({ setKeyframeTime }) => (
          <Drag>
            {({ isDragging, onDragStart }) => (
              <TweenKeyframe
                keyframe={keyframe}
                isDragging={isDragging}
                onMouseDown={e => {
                  if (!this.containerRef) return;
                  if (e.button !== 0) return;

                  const rect = this.containerRef.getBoundingClientRect();

                  onDragStart(e, ({ pageX }) => {
                    const time = clamp((pageX - rect.left) / rect.width, 0, 1);
                    setKeyframeTime(keyframe.id, time);
                  })
                }}
              />
            )}
          </Drag>
        )}
      </AnimationStore.Consumer>
    );
  }

  render() {
    const {
      tween,
      style
    } = this.props;

    return (
      <TweenContainer style={style} ref={this.captureRef}>
        <AnimationStore.Consumer>
          {({ getKeyframes, setTweenPosition }) => {
            const keyframes = getKeyframes(tween.id);
            if (keyframes.length === 0) return null;

            return (
              <Drag>
                {({ onDragStart }) => (
                  <TweenBar
                    ref={this.captureBarRef}
                    keyframes={keyframes}
                    onMouseDown={e => {
                      if (e.target !== this.barRef) return;
                      if (!this.containerRef || !this.barRef) return;

                      const rect = this.containerRef.getBoundingClientRect();
                      const barRect = this.barRef.getBoundingClientRect();

                      const initRatio = (barRect.left - rect.left) / rect.width;

                      onDragStart(e, ({ deltaX }) => {
                        const time = clamp(initRatio + deltaX / rect.width, 0, 1);
                        setTweenPosition(tween.id, time);
                      })
                    }}
                  >
                    {keyframes.map(keyframe => this.renderKeyframe(keyframe))}
                  </TweenBar>
                )}
              </Drag>
            );
          }}
        </AnimationStore.Consumer>
      </TweenContainer>
    );
  }
}















const Head = ({ anim }) => (
  <UIStore.Consumer>
    {({ selectedAnimId, setSelectedAnim }) => (
      <div
        className={classnames(styles.head, {
          [styles.selected]: selectedAnimId === anim.id
        })}
        onClick={() => setSelectedAnim(anim.id)}
      >
        <IconButton
          onClick={() => {
            // const { anim, animIndex } = removeAnimation(selectedAnimId);

            // // if removing selected, apply new selected
            // if (anim.id === selectedAnimId) {
            //   const nextAnim = animations[animIndex + 1] || animations[animIndex - 1];
            //   this.setState({
            //     selectedAnimId: nextAnim ? nextAnim.id : ''
            //   });
            // }
          }}
        >
          <Icon name="close" />
        </IconButton>
        <ContextField
          label={anim.name}
          fieldIndex={0}
        // onClick={
        //   () => this.setState({ selectedAnimId: anim.id })
        // }
        />
      </div>
    )}
  </UIStore.Consumer>
)

const Animation = ({ className, anim }) => (
  <div className={classnames(styles.container, className)}>
    <Head anim={anim} />
    <div className={styles.tweens}>
      <AnimationStore.Consumer>
        {({ getTweens }) => (
          getTweens(anim.id).map((tween, tweenIndex, tweens) => (
            <div key={tween.id}>
              <div
                style={{
                  display: 'flex'
                }}
              >
                <TweenLabel
                  tween={tween}
                />
                <TweenTimeline
                  tween={tween}
                  style={{ flex: 1 }}
                  underlined={tweenIndex !== tweens.length - 1}
                />
              </div>

              <UIStore.Consumer>
                {({ expandedTweenId }) => expandedTweenId === tween.id && (
                  <div className={styles.valueEditor}>
                    <ValueEditor tween={tween} />
                  </div>
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
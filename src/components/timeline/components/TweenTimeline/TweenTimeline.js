import React from 'react';
import classnames from 'classnames';
import { AnimationStore, MediaStore, UIStore } from 'stores';
import Canvas from 'components/shared/Canvas';
import Drag from 'components/shared/Drag';

import styles from './TweenTimeline.scss';

const TICK_COLOR = '#a1a1a1';

class Ticks extends React.Component {
  onResize = ({ cvs, ctx }) => {
    const { width, height } = cvs;
    ctx.clearRect(0, 0, width, height);

    const getHeight = i => {
      if (i % 10 === 0) return 12;
      if (i % 5 === 0) return 8;
      return 4;
    };

    ctx.fillStyle = TICK_COLOR;

    const spacing = 10;

    let x = spacing;
    let i = 1;

    while (x < width) {
      const h = getHeight(i);
      const y = height - h;
      ctx.fillRect(x, y, 1, h);
      ++i;
      x += spacing;
    }
  };

  render() {
    return (
      <div
        className={styles.ticks}
        style={{ height: 12 }}
      >
        <Canvas onResize={this.onResize} />
      </div>
    );
  }
}

const Keyframe = ({ keyframe, isDragging, onMouseDown }) => (
  <MediaStore.Consumer>
    {({ playhead, setPlayhead }) => (
      <div
        className={classnames(styles.keyframe, {
          [styles.dragging]: isDragging,
          [styles.atPlayhead]: playhead === keyframe.time
        })}
        style={{ left: `${keyframe.time * 100}%` }}
        onClick={() => setPlayhead(keyframe.time)}
        onMouseDown={onMouseDown}
      />
    )}
  </MediaStore.Consumer>
)

const TweenBar = ({ keyframe0, keyframe1 }) => (
  <div
    className={styles.bar}
    style={{
      left: `${keyframe0.time * 100}%`,
      right: `${(1 - keyframe1.time) * 100}%`
    }}
  />
);

const TweenTimeline = ({ tween, tweenIndex }) => {
  const timelineRef = React.useRef(null);

  return (
    <UIStore.Consumer>
      {({ isTweenHidden }) => !isTweenHidden(tween.id) && (
        <div
          ref={timelineRef}
          className={classnames(styles.container, {
            [styles.odd]: tweenIndex & 1
          })}
        >
          <AnimationStore.Consumer>
            {({ getKeyframes, setKeyframeTime }) => {
              const keyframes = getKeyframes(tween.id);
              if (keyframes.length === 0) return null;

              const bars = [];
              for (let i = 0; i < keyframes.length - 1; ++i) {
                const kf0 = keyframes[i];
                const kf1 = keyframes[i + 1];
                bars.push(<TweenBar key={kf0.time} keyframe0={kf0} keyframe1={kf1} />);
              }

              return (
                <>
                  {bars}
                  {keyframes.map(keyframe => (
                    <Drag key={keyframe.id}>
                      {({ isDragging, startDrag }) => (
                        <Keyframe
                          keyframe={keyframe}
                          isDragging={isDragging}
                          onMouseDown={event => {
                            if (!timelineRef.current) return;
                            if (event.button !== 0) return;

                            const rect = timelineRef.current.getBoundingClientRect();
                            startDrag({
                              event,
                              onUpdate: ({ pageX }) => {
                                const time = (pageX - rect.left) / rect.width;
                                setKeyframeTime(keyframe.id, time);
                              }
                            })
                          }}
                        />
                      )}
                    </Drag>
                  ))}
                  <Ticks />
                </>
              )
            }}
          </AnimationStore.Consumer>
        </div>
      )}
    </UIStore.Consumer>
  );
}

export default TweenTimeline;
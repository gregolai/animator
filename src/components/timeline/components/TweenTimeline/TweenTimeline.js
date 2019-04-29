import React from 'react';
import classnames from 'classnames';
import { AnimationStore, MediaStore, UIStore } from 'stores';
import { Canvas, Drag } from 'components/shared';
import { INTERVAL_MS } from 'utils/constants';

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

    const duration = this.props.duration;
    const spacing = this.props.tickSpacing;

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
    return <Canvas onResize={this.onResize} />;
  }
}

const Keyframe = ({ keyframe, isDragging, onMouseDown }) => (
  <MediaStore.Consumer>
    {({ tickSpacing, playhead, setPlayhead }) => (
      <div
        className={classnames(styles.keyframe, {
          [styles.dragging]: isDragging,
          [styles.atPlayhead]: playhead === keyframe.time
        })}
        style={{ left: `${keyframe.time / INTERVAL_MS * tickSpacing}px` }}
        onClick={() => setPlayhead(keyframe.time)}
        onMouseDown={onMouseDown}
      />
    )}
  </MediaStore.Consumer>
)

const TweenBar = ({ keyframe0, keyframe1 }) => (
  <MediaStore.Consumer>
    {({ tickSpacing }) => (
      <div
        className={styles.bar}
        style={{
          left: `${keyframe0.time / INTERVAL_MS * tickSpacing}px`,
          width: `${(keyframe1.time - keyframe0.time) / INTERVAL_MS * tickSpacing}px`
        }}
      />
    )}
  </MediaStore.Consumer>
);

const TweenTimeline = ({ tween, tweenIndex }) => {
  const timelineRef = React.useRef(null);

  return (
    <MediaStore.Consumer>
      {({ duration, tickSpacing }) => (
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
                                    const time = (pageX - rect.left) / tickSpacing * INTERVAL_MS;
                                    setKeyframeTime(keyframe.id, time);
                                  }
                                })
                              }}
                            />
                          )}
                        </Drag>
                      ))}
                      <div className={styles.ticks}>
                        <Ticks
                          duration={duration}
                          tickSpacing={tickSpacing}
                        />
                      </div>
                    </>
                  )
                }}
              </AnimationStore.Consumer>
            </div>
          )}
        </UIStore.Consumer>
      )}
    </MediaStore.Consumer>
  );
}

export default TweenTimeline;
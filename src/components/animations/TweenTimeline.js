import { React, cx } from 'utils';

import { AnimationStore } from 'stores';
import { Ticks } from 'components/shared';
import { startDrag } from 'utils/mouse';

import LocalPlayheadStore from './LocalPlayheadStore';
import styles from './TweenTimeline.module.scss';

const Keyframe = ({ keyframe, isDragging, onClick, onMouseDown }) => (
  <div
    className={cx(styles.keyframe, {
      [styles.dragging]: isDragging,
      //[styles.atPlayhead]: playhead === keyframe.time
    })}
    style={{ left: `${keyframe.time * 100}%` }}
    onClick={onClick}
    onMouseDown={onMouseDown}
  />
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

const TweenTimeline = ({ className, height, tween }) => {

  const [dragKeyframeId, setDragKeyframeId] = React.useState(-1);
  const timelineRef = React.useRef();

  return (
    <div ref={timelineRef} style={{ height }} className={cx(styles.container, className)}>
      <Ticks.EvenSpaced
        count={100}
        ticks={[
          { mod: 10, height: 12, color: '#c1c1c1' },
          { mod: 5, height: 8, color: '#c1c1c1' },
          { mod: 1, height: 4, color: '#c1c1c1' }
        ]}
      />

      <LocalPlayheadStore.Consumer>
        {({ setLocalPlayhead }) => (


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
                    <Keyframe
                      key={keyframe.id}
                      keyframe={keyframe}
                      isDragging={dragKeyframeId === keyframe.id}
                      onClick={() => {
                        // if (dragKeyframeId == -1) {
                        //   setLocalPlayhead(keyframe.time)
                        // }
                      }}
                      onMouseDown={e => {
                        if (!timelineRef.current) return;

                        //const rect = timelineRef.current.getBoundingClientRect();
                        const width = timelineRef.current.clientWidth;
                        console.log({ width })
                        const savedPixel = keyframe.time * width;
                        startDrag(e, {
                          distance: 4,
                          onDragStart: () => {
                            setDragKeyframeId(keyframe.id)
                          },
                          onDrag: ({ deltaX }) => {
                            const time = (savedPixel + deltaX) / width;
                            setKeyframeTime(keyframe.id, time);
                          },
                          onDragEnd: () => {
                            setDragKeyframeId(-1);
                          }
                        })
                      }}
                    />
                  ))}
                </>
              );
            }}
          </AnimationStore.Consumer>
        )}
      </LocalPlayheadStore.Consumer>

    </div>
  )
}

export default TweenTimeline;
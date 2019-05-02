import { React } from 'utils';

import { AnimationStore, MediaStore } from 'stores';
import { AddDropdown, Canvas, ExpandingTitle, IconButton, Ticks } from 'components/shared';
import { startDrag } from 'utils/mouse';

import LocalPlayheadStore from './LocalPlayheadStore';
import TweenControls from './TweenControls';
import TweenTimeline from './TweenTimeline';

import styles from './Animation.module.scss';

const TWEEN_HEIGHT_PX = 33;

const HeadLeft = ({ animation }) => (
  <AnimationStore.Consumer>
    {({ createTween, deleteAnimation, setAnimationName, getUnusedPropDefinitions }) => (
      <div className={styles.left}>
        <ExpandingTitle
          accessory={
            <IconButton
              icon="close"
              onClick={() => deleteAnimation(animation.id)}
            />
          }
          color={animation.color}
          label={animation.name}
          onLabelChange={name => setAnimationName(animation.id, name)}
        />
        <AddDropdown
          className={styles.btnAddTween}
          label="Add Tween"
          onSelect={definitionId => {
            createTween(animation.id, definitionId);
          }}
          options={
            getUnusedPropDefinitions(animation.id).map(definition => ({
              label: definition.id,
              value: definition.id,
            }))
          }
        />
      </div>
    )}
  </AnimationStore.Consumer>
)


const Tween = ({ tween }) => {
  return (
    <div className={styles.tween} style={{ height: TWEEN_HEIGHT_PX }}>
      <TweenControls tween={tween} />
      <TweenTimeline
        className={styles.tweenTimeline}
        height={TWEEN_HEIGHT_PX}
        tween={tween}
      />
    </div>
  )
}

const Animation = ({ animation }) => {

  const [isDraggingLocalPlayhead, setDraggingLocalPlayhead] = React.useState(false);

  return (
    <LocalPlayheadStore>
      <AnimationStore.Consumer>
        {({ getTweens, getInstances, getInstanceDefinitionValue }) => {
          const tweens = getTweens(animation.id);
          const instances = getInstances(i => i.animId === animation.id);

          const playheadCursorHeight = tweens.length * TWEEN_HEIGHT_PX;

          return (
            <div className={styles.container}>
              <div className={styles.head}>
                <HeadLeft animation={animation} />
                {tweens.length > 0 && (
                  <div className={styles.right}>

                    {/* PLAYHEAD */}
                    <Ticks.EvenSpaced
                      count={100}
                      ticks={[
                        {
                          mod: 10,
                          height: 8,
                          color: '#a1a1a1',
                          drawExtra: ({ ctx, index, x, y }) => {
                            ctx.font = '10px "Helvetica Neue", sans-serif';
                            const text = `${index / 10}`;
                            const measured = ctx.measureText(text);
                            ctx.fillText(text, x - (measured.width / 2), y - 4);
                          }
                        },
                        { mod: 5, height: 4, color: '#a1a1a1' },
                        { mod: 1, height: 2, color: '#a1a1a1' },
                      ]}
                    />

                    {/* PLAYHEAD CURSOR (OVERLAY) */}
                    <LocalPlayheadStore.Consumer>
                      {({ localPlayhead, setLocalPlayhead }) => (
                        <div
                          className={styles.playheadCursor}
                          onMouseDown={e => {
                            const width = e.target.clientWidth;

                            const onDrag = ({ localX }) => setLocalPlayhead(localX / width);
                            startDrag(e, {
                              distance: 0,
                              measureLocalOffset: true,
                              onDragStart: ({ localX }) => {
                                setDraggingLocalPlayhead(true);
                                onDrag({ localX });
                              },
                              onDrag,
                              onDragEnd: () => setDraggingLocalPlayhead(false)
                            })
                          }}
                        >
                          <div style={{ height: playheadCursorHeight }}>

                            <MediaStore.Consumer>
                              {({ playhead }) => (
                                <Canvas
                                  onResize={({ cvs, ctx }) => {
                                    const { width, height } = cvs;
                                    ctx.clearRect(0, 0, width, height);

                                    if (localPlayhead !== undefined) {
                                      const left = Math.floor(localPlayhead * width);

                                      const lineWidth = isDraggingLocalPlayhead ? 3 : 1;

                                      ctx.fillStyle = animation.color;
                                      ctx.fillRect(left - Math.floor(lineWidth / 2), 0, lineWidth, height);
                                    }

                                    instances.forEach(instance => {
                                      const delay = getInstanceDefinitionValue(instance.id, 'animation-delay');
                                      if (playhead < delay) return;

                                      const duration = getInstanceDefinitionValue(instance.id, 'animation-duration');
                                      if (playhead >= delay + duration) return;

                                      const left = Math.floor((playhead - delay) / duration * width);

                                      ctx.fillStyle = 'black';
                                      ctx.fillRect(left, 0, 1, height);
                                    })
                                  }}
                                />
                              )}
                            </MediaStore.Consumer>

                          </div>
                        </div>
                      )}
                    </LocalPlayheadStore.Consumer>

                  </div>
                )}
              </div>

              {/* TWEENS */}
              <div className={styles.tweens}>
                {tweens.map(tween => <Tween key={tween.id} tween={tween} />)}
              </div>
            </div>
          )
        }}
      </AnimationStore.Consumer>
    </LocalPlayheadStore>
  )
}

export default Animation;
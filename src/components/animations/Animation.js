import { React, cx } from 'common';

import { AnimationStore, UIStore } from 'stores';
import { AddDropdown, ExpandingTitle, IconButton, Ticks } from 'components/shared';

import LocalPlayheadStore from './LocalPlayheadStore';
import PlayheadCursor from './PlayheadCursor';
import TweenControls from './TweenControls';
import TweenTimeline from './TweenTimeline';

import styles from './Animation.module.scss';

const TWEEN_HEIGHT_PX = 33;

const HeadLeft = ({ animation }) => (
  <AnimationStore.Consumer>
    {({ createTween, deleteAnimation, setAnimationName, getUnusedPropDefinitions }) => (
      <div className={styles.left}>
        <ExpandingTitle
          accessory={<IconButton icon="close" onClick={() => deleteAnimation(animation.id)} />}
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
          options={getUnusedPropDefinitions(animation.id).map(definition => ({
            label: definition.id,
            value: definition.id
          }))}
        />
      </div>
    )}
  </AnimationStore.Consumer>
);

const Tween = ({ tween }) => {
  return (
    <div className={styles.tween} style={{ height: TWEEN_HEIGHT_PX }}>
      <TweenControls tween={tween} />
      <TweenTimeline className={styles.tweenTimeline} height={TWEEN_HEIGHT_PX} tween={tween} />
    </div>
  );
};

const Animation = ({ animation }) => {
  return (
    <LocalPlayheadStore>
      <UIStore.Consumer>
        {({ selectedInstanceId }) => (
          <AnimationStore.Consumer>
            {({ getTweens, getInstances }) => {
              const tweens = getTweens(animation.id);

              const hasInstance = getInstances(i => i.animationId === animation.id && i.id === selectedInstanceId).length > 0;

              return (
                <div
                  className={cx(styles.container, {
                    [styles.focused]: hasInstance
                  })}
                >
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
                                ctx.fillText(text, x - measured.width / 2, y - 4);
                              }
                            },
                            { mod: 5, height: 4, color: '#a1a1a1' },
                            { mod: 1, height: 2, color: '#a1a1a1' }
                          ]}
                        />

                        {/* PLAYHEAD CURSOR (OVERLAY) */}
                        <PlayheadCursor
                          animation={animation}
                          height={tweens.length * TWEEN_HEIGHT_PX}
                        />
                      </div>
                    )}
                  </div>

                  {/* TWEENS */}
                  <div className={styles.tweens}>
                    {tweens.map(tween => (
                      <Tween key={tween.id} tween={tween} />
                    ))}
                  </div>
                </div>
              );
            }}
          </AnimationStore.Consumer>
        )}
      </UIStore.Consumer>
    </LocalPlayheadStore>
  );
};

export default Animation;

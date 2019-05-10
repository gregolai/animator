import { React, cx } from 'common';

import { AnimationStore, UIStore } from 'stores';
import { AddDropdown, ExpandingTitle, IconButton, Ticks } from 'components/shared';

import CursorTime from './CursorTime';
import PlayheadCursor from './PlayheadCursor';
import TweenControls from './TweenControls';
import TweenTimeline from './TweenTimeline';

import styles from './Animation.module.scss';

const TWEEN_HEIGHT_PX = 33;

const HeadLeft = ({ animation }) => {
  const { createTween, deleteAnimation, setAnimationName, getUnusedStyleProps } = AnimationStore.use();
  return (
    <div className={styles.left}>
      <ExpandingTitle
        accessory={<IconButton icon="close" onClick={() => deleteAnimation(animation.id)} />}
        onEdit={name => setAnimationName(animation.id, name)}
        color={animation.color}
        label={animation.name}
      />
      <AddDropdown
        className={styles.btnAddTween}
        label="Add Tween"
        onSelect={definitionId => {
          createTween(animation.id, definitionId);
        }}
        options={getUnusedStyleProps(animation.id).map(definition => ({
          label: definition.id,
          value: definition.id
        }))}
      />
    </div>
  );
};

const Tween = ({ tween }) => {
  return (
    <div className={styles.tween} style={{ height: TWEEN_HEIGHT_PX }}>
      <TweenControls tween={tween} />
      <TweenTimeline className={styles.tweenTimeline} height={TWEEN_HEIGHT_PX} tween={tween} />
    </div>
  );
};

const Animation = ({ animation }) => {
  const { getTweens, getInstances } = AnimationStore.use();
  const { selectedInstanceId } = UIStore.use();

  const tweens = getTweens(animation.id);
  const hasInstance = getInstances(i => i.animationId === animation.id && i.id === selectedInstanceId).length > 0;

  return (
    <CursorTime animation={animation}>
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
    </CursorTime>
  );
};

export default Animation;

import { React, cx } from 'utils';

import { AnimationStore } from 'stores';
import { AddDropdown, ExpandingTitle, IconButton, Ticks } from 'components/shared';

import PlayheadCursor from './PlayheadCursor';
import Tweens from './Tweens';

import styles from './Animations.module.scss';

const HeadLeft = ({ animation }) => (
  <AnimationStore.Consumer>
    {({ createTween, deleteAnimation, getUnusedPropDefinitions }) => (
      <div className={styles.left}>
        <ExpandingTitle
          accessory={
            <IconButton
              icon="close"
              onClick={() => deleteAnimation(animation.id)}
            />
          }
          label={animation.name}
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

const HeadRight = ({ animation }) => (
  <div className={styles.right}>
    <Ticks.EvenSpaced
      count={100}
      ticks={[
        {
          mod: 10,
          height: 12,
          color: '#a1a1a1',
          drawExtra: ({ ctx, index, x, y }) => {
            ctx.font = '12px "Helvetica Neue", sans-serif';
            const text = `${index}`;
            const measured = ctx.measureText(text);
            ctx.fillText(text, x - (measured.width / 2), y - 4);
          }
        },
        { mod: 5, height: 8, color: '#a1a1a1' },
        { mod: 1, height: 4, color: '#a1a1a1' },
      ]}
    />
    <PlayheadCursor animation={animation} />
  </div>
)

const Animation = ({ animation }) => {

  const renderHead = () => (
    <div className={styles.head}>
      <HeadLeft animation={animation} />
      <HeadRight animation={animation} />
    </div>
  );

  return (
    <div className={styles.animation}>
      {renderHead()}
      <Tweens animation={animation} />
    </div>
  )
}

const Animations = ({ className }) => {
  return (
    <div className={cx(styles.container, className)}>

      <AnimationStore.Consumer>
        {({ getAnimations }) => getAnimations().map(animation => <Animation key={animation.id} animation={animation} />)}
      </AnimationStore.Consumer>
    </div>
  )
}
export default Animations;
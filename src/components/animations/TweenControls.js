import { React, cx } from 'utils';

import { AnimationStore, MediaStore, UIStore } from 'stores';
import { IconButton, ValueButton } from 'components/shared';
import { getDefinition } from 'utils/definitions';

import styles from './TweenControls.module.scss';

const LockButton = ({ tween }) => (
  <UIStore.Consumer>
    {({ isTweenLocked, setTweenLocked, setTweenExpanded }) => (
      <IconButton
        icon="lock"
        isToggled={isTweenLocked(tween.id)}
        onClick={() => {
          setTweenLocked(tween.id, !isTweenLocked(tween.id));
          setTweenExpanded(tween.id, false);
        }}
      />
    )}
  </UIStore.Consumer>
)

const VisibleButton = ({ tween }) => (
  <UIStore.Consumer>
    {({ isTweenHidden, setTweenHidden, setTweenExpanded }) => (
      <IconButton
        icon="passwordshow"
        isToggled={isTweenHidden(tween.id)}
        onClick={() => {
          setTweenHidden(tween.id, !isTweenHidden(tween.id));
          setTweenExpanded(tween.id, false);
        }}
      />
    )}
  </UIStore.Consumer>
)

const TweenValueButton = ({ tween }) => (
  <AnimationStore.Consumer>
    {({ createKeyframe, deleteKeyframe, getKeyframeAtTime }) => (
      <UIStore.Consumer>
        {({ isTweenLocked, isTweenHidden, isTweenExpanded, setTweenExpanded }) => (
          <AnimationStore.Consumer>
            {({ deleteTween, interpolate }) => (
              <MediaStore.Consumer>
                {({ playhead }) => {
                  const definition = getDefinition(tween.definitionId);
                  const value = interpolate(tween.id, playhead);

                  const isLocked = isTweenLocked(tween.id);
                  const isHidden = isTweenHidden(tween.id);

                  const canDelete = !isLocked && !isHidden;
                  const canExpand = !isLocked && !isHidden;

                  const isExpanded = isTweenExpanded(tween.id);

                  return (
                    <ValueButton
                      accessory={canDelete &&
                        <IconButton
                          icon="close"
                          onClick={() => deleteTween(tween.id)}
                        />
                      }
                      className={styles.btnValue}
                      definition={definition}
                      isToggled={isExpanded}
                      onClick={
                        canExpand ?
                          () => setTweenExpanded(tween.id, !isExpanded) :
                          undefined
                      }
                      value={value}
                    />
                  )
                }}
              </MediaStore.Consumer>
            )}
          </AnimationStore.Consumer>
        )}
      </UIStore.Consumer>
    )}
  </AnimationStore.Consumer>
)

const TweenControls = ({ className, tween }) => {
  return (
    <div className={cx(styles.container, className)}>
      <TweenValueButton tween={tween} />
      <LockButton tween={tween} />
      <VisibleButton tween={tween} />
    </div>
  )
}
export default TweenControls;
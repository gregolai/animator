import { React, cx } from 'utils';

import { AnimationStore, MediaStore, UIStore } from 'stores';
import { IconButton, Popover, ValueButton, ValueEditor } from 'components/shared';
import { getDefinition } from 'utils/definitions';

import styles from './TweenControls.module.scss';

const TweenControls = ({ className, tween }) => (
  <AnimationStore.Consumer>
    {({ deleteTween, interpolate, setKeyframeValueAtTime }) => (
      <UIStore.Consumer>
        {({ isTweenHidden, setTweenHidden, isTweenLocked, setTweenLocked, isTweenExpanded, setTweenExpanded }) => (
          <MediaStore.Consumer>
            {({ playhead }) => {
              const definition = getDefinition(tween.definitionId);
              const value = interpolate(tween.id, playhead);

              const isLocked = isTweenLocked(tween.id);
              const isHidden = isTweenHidden(tween.id);
              const isExpanded = isTweenExpanded(tween.id);

              const canDelete = !isLocked && !isHidden;
              const canExpand = !isLocked && !isHidden;

              return (
                <div className={cx(styles.container, className)}>
                  {/* PREVIEW */}
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

                  {/* LOCK BUTTON */}
                  <IconButton
                    icon="lock"
                    isToggled={isLocked}
                    onClick={() => {
                      // toggle lock
                      const lock = !isLocked;
                      setTweenLocked(tween.id, lock);
                      if (lock) setTweenExpanded(tween.id, false);
                    }}
                  />

                  {/* VISIBLE BUTTON */}
                  <IconButton
                    icon={isHidden ? 'passwordhide' : 'passwordshow'}
                    isToggled={isHidden}
                    onClick={() => {
                      // toggle hide
                      const hide = !isHidden;
                      setTweenHidden(tween.id, hide);
                      if (hide) setTweenExpanded(tween.id, false);
                    }}
                  />

                  {/* VALUE EDITOR */}
                  {isExpanded && (
                    <Popover anchor="down-left" className={styles.editor}>
                      <ValueEditor
                        definitionId={tween.definitionId}
                        value={value}
                        onChange={value => setKeyframeValueAtTime(tween.id, playhead, value)}
                      />
                    </Popover>
                  )}
                </div>
              );

            }}
          </MediaStore.Consumer>
        )}
      </UIStore.Consumer>
    )}
  </AnimationStore.Consumer>
)
export default TweenControls;
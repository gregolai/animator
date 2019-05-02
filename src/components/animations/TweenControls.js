import { React, cx } from 'common';

import { AnimationStore, UIStore } from 'stores';
import { IconButton, Popover, ValueButton, ValueEditor } from 'components/shared';
import { getDefinition } from 'utils/definitions';

import styles from './TweenControls.module.scss';

const TweenControls = ({ className, tween }) => (
  <AnimationStore.Consumer>
    {({ deleteTween, interpolate, getKeyframeAtTime, createKeyframe, deleteKeyframe, getInstance, setKeyframeValueAtTime, getInstanceDefinitionValue }) => (
      <UIStore.Consumer>
        {({
          playhead,
          isTweenHidden,
          setTweenHidden,
          isTweenLocked,
          setTweenLocked,
          isTweenExpanded,
          setTweenExpanded,
          selectedInstanceId,
          getLocalPlayhead
        }) => {

          const getCurrentTime = () => {
            if (selectedInstanceId !== -1) {
              const instance = getInstance(selectedInstanceId);
              const delay = getInstanceDefinitionValue(instance.id, 'animation-delay');
              const duration = getInstanceDefinitionValue(instance.id, 'animation-duration');
              return ((playhead - delay) / duration);
            } else {
              return getLocalPlayhead(tween.animationId) || 0;
            }
          }

          const currentTime = getCurrentTime();
          const keyframeAtTime = getKeyframeAtTime(tween.id, currentTime);
          const value = interpolate(tween.id, currentTime);

          const definition = getDefinition(tween.definitionId);

          const isLocked = isTweenLocked(tween.id);
          const isHidden = isTweenHidden(tween.id);
          const isExpanded = isTweenExpanded(tween.id);

          const canDelete = !isLocked && !isHidden;
          const canExpand = !isLocked && !isHidden;

          return (
            <div className={cx(styles.container, className)}>
              {/* PREVIEW */}
              <ValueButton
                accessory={
                  canDelete && <IconButton icon="close" onClick={() => deleteTween(tween.id)} />
                }
                className={styles.btnValue}
                definition={definition}
                isToggled={isExpanded}
                onClick={canExpand ? () => setTweenExpanded(tween.id, !isExpanded) : undefined}
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

              {/* CLEAR KEYFRAME BUTTON */}
              <IconButton
                className={cx()}
                icon={keyframeAtTime ? 'clear' : 'addBlock'}
                onClick={() => {
                  if (keyframeAtTime) {
                    deleteKeyframe(keyframeAtTime.id);
                  } else {
                    createKeyframe(tween.id, currentTime, value);
                  }
                }}
              />

              {/* VALUE EDITOR */}
              {isExpanded && (
                <Popover anchor="down-left" className={styles.editor}>
                  <ValueEditor
                    definitionId={tween.definitionId}
                    value={value}
                    onChange={value => setKeyframeValueAtTime(tween.id, currentTime, value)}
                  />
                </Popover>
              )}
            </div>
          );
        }}
      </UIStore.Consumer>
    )}
  </AnimationStore.Consumer>
);
export default TweenControls;

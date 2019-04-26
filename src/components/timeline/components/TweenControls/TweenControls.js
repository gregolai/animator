import React from 'react';
import classnames from 'classnames';

import IconButton from 'components/shared/IconButton';
import Hover from 'components/shared/Hover';
import ValueButton from 'components/shared/ValueButton';
import { getDefinition } from 'utils/definitions';

import { AnimationStore, MediaStore, UIStore } from 'stores'

import styles from './TweenControls.scss';

const ToggleLock = ({ tween }) => (
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

const ToggleVisible = ({ tween }) => (
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

const DeleteTween = ({ isHovering, tween }) => (
  <UIStore.Consumer>
    {({ isTweenLocked, isTweenHidden }) => (

      <AnimationStore.Consumer>
        {({ deleteTween }) => (

          <IconButton
            className={classnames(styles.btnDelete, {
              [styles.hidden]: !isHovering || isTweenLocked(tween.id) || isTweenHidden(tween.id)
            })}
            icon="close"
            onClick={() => {
              const canDelete = !isTweenLocked(tween.id) && !isTweenHidden(tween.id);
              if (canDelete) {
                deleteTween(tween.id)
              }
            }}
          />

        )}
      </AnimationStore.Consumer>

    )}
  </UIStore.Consumer>
)

const TweenLabel = ({ tween }) => (
  <UIStore.Consumer>
    {({ isTweenLocked, isTweenHidden, isTweenExpanded, setTweenExpanded }) => (

      <MediaStore.Consumer>
        {({ playhead }) => (

          <AnimationStore.Consumer>
            {({ interpolate }) => (

              <Hover>
                {({ hoverRef, isHovering }) => (
                  <ValueButton
                    ref={hoverRef}
                    accessory={<DeleteTween isHovering={isHovering} tween={tween} />}
                    className={classnames(styles.btnValue, {
                      [styles.locked]: isTweenLocked(tween.id),
                      [styles.hidden]: isTweenHidden(tween.id)
                    })}
                    definition={getDefinition(tween.definitionId)}
                    isToggled={isTweenExpanded(tween.id)}
                    onClick={() => {
                      const canExpand = !isTweenLocked(tween.id) && !isTweenHidden(tween.id);
                      if (canExpand) {
                        setTweenExpanded(tween.id, !isTweenExpanded(tween.id))
                      }
                    }}
                    value={interpolate(tween.id, playhead)}
                  />
                )}
              </Hover>
            )}
          </AnimationStore.Consumer>

        )}
      </MediaStore.Consumer>

    )}
  </UIStore.Consumer>
);

const TweenControls = ({ tween, tweenIndex }) => (
  <div className={styles.container}>
    <TweenLabel tween={tween} />
    <ToggleLock tween={tween} />
    <ToggleVisible tween={tween} />
  </div>
)

export default TweenControls;
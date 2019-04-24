import React from 'react';
import classnames from 'classnames';
import { Icon } from 'components/core';

import Button from 'components/shared/Button';
import Hover from 'components/shared/Hover';
import ValueButton from 'components/shared/ValueButton';

import { AnimationStore, MediaStore, UIStore } from 'stores'

import styles from './TweenControls.scss';

const SmallButton = ({ className, icon, isToggled, onClick }) => (
  <Button
    className={classnames(styles.btnSmall, className)}
    isToggled={isToggled}
    onClick={onClick}
  >
    <Icon name={icon} />
  </Button>
)

const LabelValue = ({ tween }) => (
  <UIStore.Consumer>
    {({ isTweenLocked, isTweenHidden, isTweenExpanded, setTweenExpanded }) => (

      <MediaStore.Consumer>
        {({ playhead }) => (

          <AnimationStore.Consumer>
            {({ interpolate, deleteTween, getDefinition }) => (

              <Hover>
                {({ hoverRef, isHovering }) => (
                  <ValueButton
                    ref={hoverRef}
                    accessory={isHovering && (
                      <SmallButton
                        icon="close"
                        onClick={() => deleteTween(tween.id)}
                      />
                    )}
                    className={classnames(styles.btnValue, {
                      [styles.locked]: isTweenLocked(tween.id),
                      [styles.hidden]: isTweenHidden(tween.id)
                    })}
                    definition={getDefinition(tween.definitionId)}
                    isToggled={isTweenExpanded(tween.id)}
                    label={getDefinition(tween.definitionId).name}
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

const ToggleLock = ({ tween }) => (
  <UIStore.Consumer>
    {({ isTweenLocked, setTweenLocked, setTweenExpanded }) => (
      <SmallButton
        className={styles.btnLock}
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

const TweenControls = ({ tween, tweenIndex }) => (
  <UIStore.Consumer>
    {({ isAnimationSelected, isTweenLocked, setTweenLocked, isTweenHidden, setTweenHidden, isTweenExpanded, setTweenExpanded }) => (

      <div className={styles.container}>
        <LabelValue tween={tween} />
        <ToggleLock tween={tween} />


        <SmallButton
          icon="passwordshow"
          isToggled={isTweenHidden(tween.id)}
          onClick={() => {
            const hide = !isTweenHidden(tween.id);
            setTweenHidden(tween.id, hide);
            if (hide) {
              setTweenExpanded(-1);
            }
          }}
        />
      </div>

    )}
  </UIStore.Consumer>
)

export default TweenControls;
import React from 'react';
import classnames from 'classnames';

import { IconButton, ValueButton } from 'components/shared';
import { getDefinition } from 'utils/definitions';

import { AnimationStore, MediaStore, UIStore } from 'stores';

import styles from './TweenControls.module.scss';

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
);

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
);

const DeleteTween = ({ tween }) => (
  <UIStore.Consumer>
    {({ isTweenLocked, isTweenHidden }) => (
      <AnimationStore.Consumer>
        {({ deleteTween }) => (
          <IconButton
            className={classnames(styles.btnDelete, {
              [styles.hidden]: isTweenLocked(tween.id) || isTweenHidden(tween.id)
            })}
            icon="close"
            onClick={() => {
              const canDelete = !isTweenLocked(tween.id) && !isTweenHidden(tween.id);
              if (canDelete) {
                deleteTween(tween.id);
              }
            }}
          />
        )}
      </AnimationStore.Consumer>
    )}
  </UIStore.Consumer>
);

const TweenLabel = ({ time, tween, value }) => (
  <AnimationStore.Consumer>
    {({ createKeyframe, deleteKeyframe, getKeyframeAtTime }) => (
      <UIStore.Consumer>
        {({ isTweenLocked, isTweenHidden, isTweenExpanded, setTweenExpanded }) => (
          <ValueButton
            accessory={<DeleteTween tween={tween} />}
            className={classnames(styles.btnValue, {
              [styles.locked]: isTweenLocked(tween.id),
              [styles.hidden]: isTweenHidden(tween.id)
            })}
            definition={getDefinition(tween.definitionId)}
            isToggled={isTweenExpanded(tween.id)}
            canClear={true}
            onClear={() => {
              const keyframe = getKeyframeAtTime(tween.id, time);
              if (keyframe) {
                deleteKeyframe(keyframe.id);
              } else {
                createKeyframe(tween.id, time, value);
                setTweenExpanded(tween.id, true);
              }
            }}
            onClick={() => {
              const canExpand = !isTweenLocked(tween.id) && !isTweenHidden(tween.id);
              if (canExpand) {
                setTweenExpanded(tween.id, !isTweenExpanded(tween.id));
              }
            }}
            value={value}
          />
        )}
      </UIStore.Consumer>
    )}
  </AnimationStore.Consumer>
);

const TweenControls = ({ tween, tweenIndex }) => (
  <div className={styles.container}>
    <AnimationStore.Consumer>
      {({ interpolate }) => (
        <MediaStore.Consumer>
          {({ playhead }) => (
            <TweenLabel time={playhead} value={interpolate(tween.id, playhead)} tween={tween} />
          )}
        </MediaStore.Consumer>
      )}
    </AnimationStore.Consumer>

    <ToggleLock tween={tween} />
    <ToggleVisible tween={tween} />
  </div>
);

export default TweenControls;

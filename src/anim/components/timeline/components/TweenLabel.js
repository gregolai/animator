import React from 'react';
import classnames from 'classnames';

import ButtonField from '@sqs/core-components/fields/ButtonField';
import Icon from '@sqs/core-components/primitives/Icon';
import IconButton from '@sqs/core-components/primitives/IconButton';

import Hover from '../../shared/Hover';

import AnimationStore from '../../../stores/AnimationStore';
import MediaStore from '../../../stores/MediaStore';
import UIStore from '../../../stores/UIStore';

import styles from './TweenLabel.scss';

const TweenLabel = ({ tween, tweenIndex }) => (
  <UIStore.Consumer>
    {({ isAnimationSelected, isTweenLocked, setTweenLocked, isTweenExpanded, setTweenExpanded }) => (
      <MediaStore.Consumer>
        {({ playhead }) => (
          <AnimationStore.Consumer>
            {({ interpolate, removeTween }) => (
              <Hover>
                {({ hoverRef, isHovering }) => (


                  <div ref={hoverRef} className={styles.container}>
                    <div className={classnames(styles.innerContainer, {
                      [styles.odd]: tweenIndex & 1
                    })}>
                      <IconButton
                        className={classnames(styles.btnDeleteTween, {
                          [styles.hidden]: !isHovering
                        })}
                        isDisabled={!isHovering}
                        onClick={() => removeTween(tween.id)}
                      >
                        <Icon name="close" />
                      </IconButton>
                      <ButtonField
                        flush
                        underlined={false}
                        alignment="right"
                        className={styles.btnName}
                        label={tween.definition.name}
                        onClick={() => setTweenExpanded(tween.id, !isTweenExpanded(tween.id))}
                        size="small"
                      />

                      <IconButton
                        style={{ width: 33 }}
                        className={styles.btnValue}
                        onClick={() => setTweenExpanded(tween.id, !isTweenExpanded(tween.id))}
                      >
                        {tween.definition.format(interpolate(tween.id, playhead))}
                      </IconButton>

                      <IconButton
                        className={classnames(styles.btnLock, {
                          [styles.locked]: isTweenLocked(tween.id)
                        })}
                        onClick={() => setTweenLocked(tween.id, !isTweenLocked(tween.id))}
                      >
                        <Icon name="lock" />
                      </IconButton>
                      <IconButton className={styles.btnVisible}>
                        <Icon name="passwordshow" />
                      </IconButton>
                    </div>
                  </div>
                )}
              </Hover>
            )}
          </AnimationStore.Consumer>
        )}
      </MediaStore.Consumer>
    )}
  </UIStore.Consumer>
)

export default TweenLabel;
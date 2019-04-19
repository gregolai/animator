import React from 'react';
import ButtonField from '@sqs/core-components/fields/ButtonField';
import Icon from '@sqs/core-components/primitives/Icon';
import IconButton from '@sqs/core-components/primitives/IconButton';

import AnimationStore from '../../../stores/AnimationStore';
import MediaStore from '../../../stores/MediaStore';

import styles from './TweenLabel.scss';

const TweenLabel = ({ tween }) => (
  <MediaStore.Consumer>
    {({ playhead }) => (
      <AnimationStore.Consumer>
        {({ interpolate, removeTween }) => (
          <div className={styles.container}>
            <div className={styles.innerContainer}>
              <IconButton className={styles.btnDeleteTween} onClick={() => removeTween(tween.id)}>
                <Icon name="close" />
              </IconButton>
              <ButtonField
                flush
                underlined={false}
                alignment="right"
                className={styles.btnExpandTween}
                label={tween.definition.name}
                onClick={() => { }}
                size="small"
              />
              <IconButton className={styles.btnLockTween}>
                <Icon name="lock" />
              </IconButton>
              <IconButton className={styles.btnDisableTween}>
                <Icon name="passwordshow" />
              </IconButton>
              <ButtonField
                flush
                underlined={false}
                alignment="right"
                label={tween.definition.format(
                  interpolate(tween.id, playhead)
                )}
                onClick={() => { }}
                size="small"
              />
            </div>
          </div>
        )}
      </AnimationStore.Consumer>
    )}
  </MediaStore.Consumer>
)

export default TweenLabel;
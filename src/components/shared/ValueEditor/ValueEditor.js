import React from 'react';
import classnames from 'classnames';
import { AnimationStore, MediaStore } from 'stores';
import { getDefinition } from 'utils/definitions';

import styles from './ValueEditor.scss';

const ValueEditor = ({ className, tween }) => (
  <div className={classnames(styles.container, className)}>
    <MediaStore.Consumer>
      {({ playhead }) => (
        <AnimationStore.Consumer>
          {({ interpolate, setKeyframeValueAtTime }) => (
            getDefinition(tween.definitionId).render({
              value: interpolate(tween.id, playhead),
              onChange: value => {
                setKeyframeValueAtTime(tween.id, playhead, value);
              }
            })
          )}
        </AnimationStore.Consumer>
      )}
    </MediaStore.Consumer>
  </div>
);

export default ValueEditor;
import React from 'react';

import AnimationStore from '../../../stores/AnimationStore';
import MediaStore from '../../../stores/MediaStore';

const ValueEditor = ({ tween }) => (
  <MediaStore.Consumer>
    {({ playhead }) => (
      <AnimationStore.Consumer>
        {({ interpolate, setKeyframeValueAtTime }) => (
          tween.definition.render({
            value: interpolate(tween.id, playhead),
            onChange: value => {
              setKeyframeValueAtTime(tween.id, playhead, value);
            }
          })
        )}
      </AnimationStore.Consumer>
    )}
  </MediaStore.Consumer>
);

export default ValueEditor;
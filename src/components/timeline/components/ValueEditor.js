import React from 'react';
import { AnimationStore, MediaStore } from 'stores';

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
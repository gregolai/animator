import React from 'react';
import interpolateKeyframes from 'utils/cc/interpolateKeyframes';
import { getStyleProp } from 'utils/cc/styleProps';

export const InterpolateProp = ({
  children,
  definitionId,
  easing,
  keyframes,
  time
}) => {
  const definition = getStyleProp(definitionId);
  if (time === undefined) return children(undefined);

  return children(
    definition ? interpolateKeyframes(keyframes, time, definition.lerp, easing) : undefined
  );
}

const AnimationController = ({
  children,
  delay = 0,
  duration = 1000,
  easing = 'linear',
  format = true,
  keyframes = {},
  time = 0
}) => {
  const ratio = (time - delay) / duration;

  return children(
    Object.entries(keyframes)
      .reduce((map, [definitionId, keyframes]) => {

        const definition = getStyleProp(definitionId);
        if (definition) {
          const value = interpolateKeyframes(keyframes, ratio, definition.lerp, easing)
          if (value !== undefined) {
            if (format) {
              map[definition.styleName] = definition.format(value);
            } else {
              map[definitionId] = value;
            }
          }
        }

        return map;
      }, {})
  );
}
export default AnimationController;

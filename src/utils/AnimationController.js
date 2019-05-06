import React from 'react';
import interpolate from 'utils/interpolate';
import { getDefinition } from 'utils/definitions';

export const InterpolateProp = ({
  children,
  definitionId,
  easing,
  keyframes,
  time
}) => {
  const definition = getDefinition(definitionId);
  if (time === undefined) return children(undefined);

  return children(
    definition ? interpolate(keyframes, time, definition.lerp, easing) : undefined
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

        const definition = getDefinition(definitionId);
        if (definition) {
          let value = interpolate(keyframes, ratio, definition.lerp, easing)
          if (format) {
            map[definition.styleName] = definition.format(value);
          } else {
            map[definitionId] = value;
          }
        }

        return map;
      }, {})
  );
}
export default AnimationController;
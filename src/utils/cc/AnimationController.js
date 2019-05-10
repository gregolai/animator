import React from 'react';
import interpolateKeyframes from './interpolateKeyframes';
import { canInterpolate, getStyleProp } from './styleProps';

const AnimationController = ({
  children,
  delay,
  duration,
  easing,
  format = true,
  keyframes = {},
  time
}) => {
  const ratio = (time - delay) / duration;

  return children(
    Object.entries(keyframes).reduce((map, [propName, keyframesArray]) => {
      const styleProp = getStyleProp(propName);

      if (styleProp && canInterpolate(propName)) {
        const value = interpolateKeyframes(
          keyframesArray,
          ratio,
          styleProp.lerp,
          easing
        );

        if (format) {
          // e.g. { marginLeft: '10px' }
          map[propName] = styleProp.format(value);
        } else {
          // e.g. { 'marginLeft': 10 }
          map[propName] = value;
        }
      }

      return map;
    }, {})
  );
};
export default AnimationController;

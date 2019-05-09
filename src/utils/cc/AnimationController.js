import React from 'react';
import interpolateKeyframes from './interpolateKeyframes';
import { canInterpolate, getStyleProp } from './styleProps';

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
      .reduce((map, [propName, keyframes]) => {

        const styleProp = getStyleProp(propName);

        if (styleProp && canInterpolate(propName)) {

          const value = interpolateKeyframes(keyframes, ratio, styleProp.lerp, easing);

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
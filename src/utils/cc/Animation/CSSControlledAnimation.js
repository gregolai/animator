import React from 'react';
import AnimationStore from '../AnimationStore';

export default ({
  children,

  /**
   * Animation delay, in milliseconds
   */
  delay = 0,

  /**
   * Animation direction: normal | reverse | alternate | alternate-reverse
   * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction
   */
  direction,

  /**
   * Animation timing function
   * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function
   */
  easing = 'linear',

  /**
   * Animation duration, in milliseconds
   */
  duration = 1000,

  /**
   * Animation fill mode
   * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
   */
  fillMode,

  /**
   * Tag name
   */
  is: TagName = 'div',

  /**
   * If set, sets CSS animation-play-state="running"
   * Otherwise, sets CSS animation-play-state="paused"
   */
  isPlaying = false,

  /**
   * Animation iteration count
   * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count
   */
  iterationCount = 1,

  /**
   * An animation name (key) passed into the closest ancestor AnimationStore. The
   * name is provided there and consumed here through a React context Provider/Consumer.
   */
  name,

  /**
   * Optional base style.
   */
  style,

  ...rest
}) => (
    <AnimationStore.Consumer>
      {({ nameToStyleIds }) => {
        const animationName = nameToStyleIds[name];
        if (!animationName) {
          // name not found
          console.warn(`Animation with name could not be found: ${name}`);
          return null;
        }

        return (
          <TagName
            {...rest}
            style={{
              ...style,
              animationName,
              animationFillMode: fillMode,
              animationDirection: direction,
              animationDuration: `${duration}ms`,
              animationDelay: `${delay}ms`,
              animationIterationCount: iterationCount,
              animationPlayState: isPlaying ? 'running' : 'paused',
              animationTimingFunction: easing
            }}
          >
            {children}
          </TagName>
        );
      }}
    </AnimationStore.Consumer>
  );

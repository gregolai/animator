import React from 'react';
import kebabCase from 'lodash/kebabCase';
import AnimationController from './AnimationController';

// a tiny 6-character hexidecimal uid shim
const uid = (length = 6) => `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)}`.slice(0, length);

const createAnimation = (name) => ({
  children,
  is: TagName = 'div',
  delay,
  direction,
  duration,
  fillMode,
  iterationCount,
  playState,
  style,
  timingFunction,
  ...rest
}) => (
    <TagName
      {...rest}
      style={{
        ...style,
        animationName: name,
        animationFillMode: fillMode,
        animationDirection: direction,
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationIterationCount: iterationCount,
        animationPlayState: playState,
        animationTimingFunction: timingFunction
      }}
    >
      {children}
    </TagName>
  );

const createControlledAnimation = (keyframes) => ({
  children,
  delay,
  duration,
  is: TagName = 'div',
  style,
  time,
  ...rest
}) => (
    <AnimationController
      delay={delay}
      duration={duration}
      easing="linear"
      format={true}
      keyframes={keyframes}
      time={time}
    >
      {formattedStyles => (
        <TagName
          {...rest}
          style={{
            ...style,
            ...formattedStyles
          }}
        >
          {children}
        </TagName>
      )}
    </AnimationController>
  );

const writeCssProp = ([key, value]) => `${kebabCase(key)}: ${value};`;

const writeKeyframe = ([key, cssProps]) => {
  if (key !== 'from' && key !== 'to' && !key.endsWith('%')) {
    key = `${key}%`;
  }
  return `${key} { ${Object.entries(cssProps).map(writeCssProp).join(' ')} }`;
};

/**
 * Remaps keyframes in this format:
 *   {
 *     [percentValue]: {
 *       [propName]: [propValue]
 *     }
 *   }
 * to this format:
 *   {
 *     [propName]: [
 *       { time: [percentValue/100], value: [propValue] }
 *     ]
 *   }
 *
 * This is an expensive operation, but is necessary to remap the AnimationProvider
 * API into AnimationController API, which is consumed by the Squarespace Animator.
 *
 * @param {Object} keyframes
 */
const remapKeyframes = (keyframes) => {

  const map = {};

  Object.entries(keyframes).forEach(([percentValue, styleObj]) => {

    const time = Number(percentValue / 100).toFixed(2);

    Object.entries(styleObj).forEach(([propName, propValue]) => {

      propName = kebabCase(propName);

      if (!map[propName]) {
        map[propName] = [];
      }

      // Prevent duplicate times
      if (map[propName].find(kf => kf.time === time)) {
        return;
      }

      map[propName].push({
        time: time,
        value: propValue
      });
    });
  });

  return map;
};

export default class AnimationProvider extends React.Component {

  constructor(props) {
    super(props);

    this.Components = {};
    this.ControlledComponents = {};
    let css = '';

    // generate a UID to prevent global CSS naming conflicts
    const slug = uid();

    Object
      .entries(props.animations)
      .forEach(([name, keyframes]) => {

        // A unique name is necessary to prevent global CSS naming conflicts
        const uniqueName = `${name}-${slug}`;

        this.Components[name] = createAnimation(uniqueName);
        this.ControlledComponents[name] = createControlledAnimation(remapKeyframes(keyframes));

        css += `@keyframes ${uniqueName} { ${Object.entries(keyframes).map(writeKeyframe).join(' ')} } `;
      });

    this.style = document.createElement('style');
    this.style.innerText = css;
    document.body.appendChild(this.style);
  }

  componentWillUnmount() {
    document.body.removeChild(this.style);
  }

  getAnimation = (name, controlled) => {
    return controlled ? this.ControlledComponents[name] : this.Components[name];
  };

  render() {
    return this.props.children(this.getAnimation);
  }
}


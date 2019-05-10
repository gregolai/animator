import React from 'react';
import uid from 'uid';
import kebabCase from 'lodash/kebabCase';

import AnimationController from 'utils/AnimationController';

const createAnimation = (name) => ({
  children,
  easing,
  is: TagName = 'div',
  delay,
  direction,
  duration,
  fillMode,
  iterationCount,
  playState,
  style,
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
        animationTimingFunction: easing
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
    key = `${key}%`
  }

  return `${key} { ${Object.entries(cssProps).map(writeCssProp).join(' ')} }`;
}

class AnimationProvider extends React.Component {

  constructor(props) {
    super(props);

    this.Components = {};
    this.ControlledComponents = {};
    let css = '';

    const slug = uid();
    Object
      .entries(props.animations)
      .forEach(([name, keyframes]) => {

        const uniqueName = `${name}_${slug}`;

        this.Components[name] = createAnimation(uniqueName);

        this.ControlledComponents[name] = createControlledAnimation(
          Object.entries(keyframes)
            .reduce((map, [percent, styleObj]) => {

              Object.entries(styleObj).forEach(([propKey, propValue]) => {
                propKey = kebabCase(propKey);

                if (!map[propKey]) {
                  map[propKey] = [];
                }
                map[propKey].push({ time: parseFloat(percent) / 100, value: propValue })
              })
              return map;
            }, {})
        );

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


const Demo = () => (
  <AnimationProvider
    animations={{
      move: {
        25: {
          backgroundColor: 'blue',
          marginLeft: 100
          //transform: 'translate(200px, 0px)'
        },
        50: {
          marginLeft: 20
          //transform: 'translate(200px, 200px)'
        },
        75: {
          backgroundColor: 'green',
          marginLeft: 400
          //transform: 'translate(0px, 200px)'
        }
      },
      backgroundify: {
        0: {
          backgroundColor: 'purple',
        },
        100: {
          backgroundColor: 'yellow'
        }
      }
    }}
  >
    {getAnimation => {
      const Animate = getAnimation('move', true);
      const Animate2 = getAnimation('backgroundify', true);

      return (
        <div>
          <Animate
            delay={0}
            duration={2000}
            time={1000}
          >
            hello
          </Animate>

          <Animate2
            delay={0}
            duration={4000}
            time={2000}
          >
            world
          </Animate2>
        </div>
      );
    }}
  </AnimationProvider>
)
export default Demo;

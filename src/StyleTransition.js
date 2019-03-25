import React from 'react';
import PropTypes from 'prop-types';
import Transition from './Transition';

const EasingPropTypes = PropTypes.oneOfType([
  PropTypes.oneOf(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']),
  PropTypes.arrayOf(PropTypes.number) // [x0, y0, x1, y1]
]);

const StylePropTypes = PropTypes.oneOfType([
  PropTypes.func,

  PropTypes.shape({
    backgroundColor: PropTypes.string,

    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    opacity: PropTypes.number,

    rotateZ: PropTypes.number,

    scale: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
    ]),
    scaleX: PropTypes.number,
    scaleY: PropTypes.number,

    translate: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    translateX: PropTypes.number,
    translateY: PropTypes.number,

    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })

]);

function getEasingArray(easing) {
  const EASING_MAP = {
    linear: [0.5, 0.5, 0.5, 0.5],
    ease: [0.25, 0.1, 0.25, 1],
    'ease-in': [0.42, 0, 1, 1],
    'ease-out': [0, 0, 0.58, 1],
    'ease-in-out': [0.42, 0, 0.58, 1]
  };
  return Array.isArray(easing) ?
    easing :
    EASING_MAP[easing] || EASING_MAP.linear;
}

export default class StyleTransition extends React.Component {
  static propTypes = {
    in: PropTypes.bool.isRequired,

    // FLAGS FOR react-transition-group
    appear: PropTypes.bool,
    enter: PropTypes.bool,
    exit: PropTypes.bool,

    enterDelay: PropTypes.number,
    enterDuration: PropTypes.number,
    enterEasing: EasingPropTypes,

    exitDelay: PropTypes.number,
    exitDuration: PropTypes.number,
    exitEasing: EasingPropTypes,

    // FALLBACKS
    delay: PropTypes.number,
    duration: PropTypes.number,
    easing: EasingPropTypes,

    // CALLBACKS
    onEnter: PropTypes.func,
    onEntering: PropTypes.func,
    onEntered: PropTypes.func,
    onExit: PropTypes.func,
    onExiting: PropTypes.func,
    onExited: PropTypes.func,

    styles: PropTypes.shape({
      // APPEAR
      appear: StylePropTypes,
      appearing: StylePropTypes,

      // ENTER
      enter: StylePropTypes,
      entering: StylePropTypes,
      entered: StylePropTypes,

      // EXIT
      exit: StylePropTypes,
      exiting: StylePropTypes,
      exited: StylePropTypes
    })
  }

  static defaultProps = {
    delay: 0,
    duration: 1000,
    easing: 'linear'
  };

  phase = 'exited';
  style = {};
  timeout = null;

  componentWillUnmount() {
    this.removeEndListener();
  }

  handleEnter = (node, appearing) => {
    return this.updateState(node, 'enter', appearing);
  };

  handleEntering = (node, appearing) => {
    return this.updateState(node, 'entering', appearing);
  };

  handleEntered = (node, appearing) => {
    return this.updateState(node, 'entered', appearing);
  };

  handleExit = node => {
    return this.updateState(node, 'exit');
  };

  handleExiting = node => {
    return this.updateState(node, 'exiting');
  };

  handleExited = node => {
    return this.updateState(node, 'exited');
  };

  async updateState(node, phase, appearing) {
    this.removeEndListener();

    const isTransitioning =
      (this.phase === 'entering' && phase === 'exit') ||
      (this.phase === 'exiting' && phase === 'enter');

    const style = await this.getComputedStyle(node, phase);
    console.log(phase, isTransitioning, style);
    
    if(!isTransitioning) {
      node.style = '';
      Object.assign(node.style, style);
    }

    this.phase = phase;
    this.style = style;
  }

  async getComputedStyle(node, phase) {
    const props = this.props;
    const styles = [];

    // PHASE-SPECIFIC STYLE
    {
      let phaseStyle = props.styles[phase];
      if (typeof phaseStyle === 'function') {
        phaseStyle = await phaseStyle({ node });
      }
      styles.push(phaseStyle);
    }

    if (phase === 'entering' || phase === 'exiting') {

      const forward = phase === 'entering';

      // Allow for flexible configuration
      let delay = forward ? props.enterDelay : props.exitDelay;
      let duration = forward ? props.enterDuration : props.exitDuration;
      let easing = forward ? props.enterEasing : props.exitEasing;
      // delay, duration, easing fallbacks
      if (delay === undefined) {
        delay = props.delay;
      }
      if (duration === undefined) {
        duration = props.duration;
      }
      if (easing === undefined) {
        easing = props.easing;
      }

      const [x0, y0, x1, y1] = getEasingArray(easing);
      styles.push({
        transition: `all ${duration}ms cubic-bezier(${x0}, ${y0}, ${x1}, ${y1})`,
        transitionDelay: `${delay}ms`
      });
    }

    // Flatten styles array into object
    return styles.reduce((styleObj, entry) => {
      Object.assign(styleObj, entry);
      return styleObj;
    }, {});
  }

  addEndListener = (node, done) => {
    this.removeEndListener();

    this.timeout = setTimeout(() => {
      this.removeEndListener();
      done();
    }, this.props.duration);
  };

  removeEndListener() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }


  render() {
    return (
      <Transition
        in={this.props.in}
        
        // callbacks
        //timeout={this.props.duration}
        addEndListener={this.addEndListener}


        onEnter={this.handleEnter}
        onEntering={this.handleEntering}
        onEntered={this.handleEntered}
        onExit={this.handleExit}
        onExiting={this.handleExiting}
        onExited={this.handleExited}

        //style={this.props.styles[this.phase]}
      >
        {this.props.children}
      </Transition>
    )
  }
}


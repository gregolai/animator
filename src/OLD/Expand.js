import React from 'react';
import StyleTransition from './StyleTransition';

const styleFrom = {
  overflow: 'hidden',
  color: 'white',
  backgroundColor: 'black'
};

const styleTo = {
  overflow: 'hidden',
  color: 'black',
  backgroundColor: 'white'
};

const isAuto = value => value === 'auto';
const isPercent = value => typeof value === 'string' && value.endsWith('%');

const toPx = v => (typeof v === 'number' ? `${v}px` : v);

const needsCalculation = value => isAuto(value) || isPercent(value);

export default class Expand extends React.Component {
  static defaultProps = {
    from: 0,
    to: 'auto'
  };

  enter = ({ node }) => {
    return this.resolveStyle(node, node.offsetHeight, styleFrom);
  };

  entering = ({ node }) => {
    return this.resolveStyle(node, this.props.to, styleTo);
  };

  entered = ({ node }) => {
    return this.resolveStyle(node, this.props.to, styleTo);
  };

  exit = ({ node }) => {
    return this.resolveStyle(node, node.offsetHeight, styleTo);
  };

  exiting = ({ node }) => {
    return this.resolveStyle(node, this.props.from, styleFrom);
  };

  exited = ({ node }) => {
    return this.resolveStyle(node, this.props.from, styleFrom);
  };

  resolveStyle(node, value, baseStyle) {
    const from = toPx(value);

    if (!needsCalculation(from)) {
      return Promise.resolve({
        ...baseStyle,
        height: from
      });
    }

    return new Promise(resolve => {
      const savedHeight = node.offsetHeight;
      node.style.height = from; // FROM HEIGHT

      const destinationHeight = node.offsetHeight;
      node.style.height = toPx(savedHeight);

      requestAnimationFrame(() => {
        resolve({
          ...baseStyle,
          height: toPx(destinationHeight)
        });
      });
    });
  }

  render() {
    return (
      <StyleTransition
        in={this.props.in}
        styles={{
          enter: this.enter,
          entering: this.entering,
          entered: this.entered,

          exit: this.exit,
          exiting: this.exiting,
          exited: this.exited
        }}
        onEntered={({ node }) => {
          node.style.height = toPx(this.props.to);
        }}
        onExited={({ node }) => {
          node.style.height = toPx(this.props.from);
        }}
      >
        <div>
          <div>hello world</div>
          <div>hello world</div>
          <div>hello world</div>
          <div>hello world</div>
          <div>hello world</div>
        </div>
      </StyleTransition>
    );
  }
}

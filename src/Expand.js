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
  }

  enter = ({ node }) => {
    return Promise.resolve({
      ...styleFrom,
      height: toPx(node.offsetHeight)
    });
  };

  entering = ({ node }) => {
    const to = toPx(this.props.to);

    if (!needsCalculation(to)) {
      return Promise.resolve({
        ...styleTo,
        height: to
      });
    }

    return new Promise(resolve => {
      const savedHeight = node.offsetHeight;
      node.style.height = to; // TO HEIGHT

      const destinationHeight = node.offsetHeight;
      node.style.height = toPx(savedHeight);

      requestAnimationFrame(() => {
        resolve({
          ...styleTo,
          height: toPx(destinationHeight),
        })
      })
    })
  };

  entered = ({ node }) => {
    return Promise.resolve({
      ...styleTo,
      height: toPx(node.offsetHeight)
    });
  };

  exit = ({ node }) => {
    return Promise.resolve({
      ...styleTo,
      height: toPx(node.offsetHeight)
    });
  };

  exiting = ({ node }) => {
    const from = toPx(this.props.from);

    if (!needsCalculation(from)) {
      return Promise.resolve({
        ...styleFrom,
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
          ...styleFrom,
          height: toPx(destinationHeight)
        })
      })
    });
  }

  exited = ({ node }) => {
    return Promise.resolve({
      ...styleFrom,
      height: toPx(node.offsetHeight)
    });
  };

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
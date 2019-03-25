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
      height: `${node.offsetHeight}px`
    });
  };

  entering = ({ node }) => {
    return new Promise(resolve => {
      if (!needsCalculation(this.props.to)) {
        resolve({
          ...styleTo,
          height: toPx(this.props.to)
        });
        return;
      }

      const savedHeight = node.offsetHeight;
      node.style.height = toPx(this.props.to); // TO HEIGHT

      const destinationHeight = node.offsetHeight;
      node.style.height = `${savedHeight}px`;

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
      height: `${node.offsetHeight}px`
    });
  };

  exit = ({ node }) => {
    return Promise.resolve({
      ...styleTo,
      height: `${node.offsetHeight}px`
    });
  };

  exiting = ({ node }) => {
    return new Promise(resolve => {
      if (!needsCalculation(this.props.from)) {
        resolve({
          ...styleFrom,
          height: toPx(this.props.from)
        });
        return;
      }

      const savedHeight = node.offsetHeight;
      node.style.height = toPx(this.props.from); // FROM HEIGHT

      const destinationHeight = node.offsetHeight;
      node.style.height = `${savedHeight}px`;

      requestAnimationFrame(() => {
        resolve({
          ...styleFrom,
          height: `${destinationHeight}px`
        })
      })
    });
  }

  exited = ({ node }) => {
    return Promise.resolve({
      ...styleFrom,
      height: `${node.offsetHeight}px`
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
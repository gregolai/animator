import React from 'react';
import noop from 'lodash/noop';

export default class Drag extends React.Component {
  state = {
    drag: null
  }

  startDrag = ({ event, onUpdate = noop, onEnd = noop }) => {
    if (this.state.drag) return;

    const { pageX, pageY, target } = event;

    this.setState({
      drag: {
        onUpdate,
        onEnd,
        deltaX: 0,
        deltaY: 0,
        startX: pageX,
        startY: pageY,
        pageX,
        pageY,
        target
      }
    });

    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mouseup', this.onMouseUp, false);
  }

  onMouseMove = event => {
    const { drag } = this.state;
    if (!drag) return;

    const { pageX, pageY } = event;

    const nextState = {
      drag: {
        ...drag,
        pageX,
        pageY,
        deltaX: pageX - drag.startX,
        deltaY: pageY - drag.startY
      }
    };

    this.setState(nextState);
    drag.onUpdate(nextState.drag);
  }

  onMouseUp = e => {
    const { drag } = this.state;
    if (!drag) return;

    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);

    this.setState({ drag: null });
    drag.onEnd(drag);
  }

  render() {
    return this.props.children({
      isDragging: !!this.state.drag,
      startDrag: this.startDrag
    });
  }
}

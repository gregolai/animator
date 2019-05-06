import { React, noop } from 'common';

const isLessThanDistance = (deltaX, deltaY, distance) => {
  return deltaX * deltaX + deltaY * deltaY < distance * distance;
};

export const startDrag = (
  mouseDownEvent,
  { distance = 1, measureTarget, onDragStart = noop, onDrag = noop, onDragEnd = noop }
) => {
  if (mouseDownEvent.persist) {
    mouseDownEvent.persist();
  }

  const { clientX: startX, clientY: startY, button } = mouseDownEvent;

  let isDragging = false;

  const _createArgs = ({ clientX, clientY, ctrlKey, shiftKey, metaKey, target }) => {
    const obj = {
      button,
      ctrlKey,
      shiftKey,
      metaKey,
      hoverTarget: target,
      clientX,
      clientY,
      deltaX: clientX - startX,
      deltaY: clientY - startY
    };

    if (measureTarget) {
      const rect = measureTarget.getBoundingClientRect();
      obj.localX = clientX - rect.left;
      obj.localY = clientY - rect.top;
      obj.ratioX = obj.localX / rect.width;
      obj.ratioY = obj.localY / rect.height;
    }

    return obj;
  };

  const _tryDragStart = e => {
    if (!isDragging) {
      const { clientX, clientY } = e;
      if (distance <= 0 || !isLessThanDistance(clientX - startX, clientY - startY, distance)) {
        onDragStart(_createArgs(mouseDownEvent));
        isDragging = true;
      }
    }
    return isDragging;
  };

  const _onMouseUp = mouseUpEvent => {
    if (mouseUpEvent.button !== button) return;

    document.removeEventListener('mousemove', _onMouseMove);
    document.removeEventListener('mouseup', _onMouseUp);

    if (!isDragging) return; // distance hasn't been satisfied

    onDragEnd(_createArgs(mouseUpEvent));
    mouseUpEvent.preventDefault();
  };

  const _onMouseMove = mouseMoveEvent => {
    if (mouseMoveEvent.button !== button) return;

    if (!_tryDragStart(mouseMoveEvent)) {
      return; //drag distance not met
    }

    onDrag(_createArgs(mouseMoveEvent));
    mouseMoveEvent.preventDefault();
  };

  if (_tryDragStart(mouseDownEvent)) {
    mouseDownEvent.preventDefault();
  }

  document.addEventListener('mousemove', _onMouseMove);
  document.addEventListener('mouseup', _onMouseUp);
};

export class MouseOffset extends React.Component {
  static defaultProps = {
    isActive: true,
    onMove: noop
  };

  clientX = 0;
  clientY = 0;

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  getMouseOffset(target) {
    const rect = target.getBoundingClientRect();
    return {
      x0: this.clientX - rect.left,
      y0: this.clientY - rect.top,
      x1: this.clientX - rect.right,
      y1: this.clientY - rect.bottom
    };
  }

  onMouseMove = e => {
    this.clientX = e.clientX;
    this.clientY = e.clientY;

    if (!this.props.isActive) return;
    if (!this.ref) return;

    this.props.onMove(this.getMouseOffset(this.ref));
  };

  captureRef = ref => {
    this.ref = ref;
  };

  render() {
    return this.props.children({
      captureRef: this.captureRef
    });
  }
}

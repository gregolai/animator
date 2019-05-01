import { React, noop } from 'utils';

const getPosition = (target, event) => {
  const rect = target.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};

const isLessThanDistance = (deltaX, deltaY, distance) => {
  return deltaX * deltaX + deltaY * deltaY < distance * distance;
};

export const startDrag = (
  mouseDownEvent,
  { distance = 1, onDragStart = noop, onDrag = noop, onDragEnd = noop }
) => {
  const { button, ctrlKey, shiftKey, metaKey, target } = mouseDownEvent;
  const { x: startX, y: startY } = getPosition(target, mouseDownEvent);

  let isDragging = false;

  const _createArgs = ({ ctrlKey, shiftKey, metaKey, target: hoverTarget }, x, y) => ({
    button,
    ctrlKey,
    shiftKey,
    metaKey,
    hoverTarget,
    x,
    y,
    deltaX: x - startX,
    deltaY: y - startY
  });

  const _tryDragStart = (x, y) => {
    if (!isDragging) {
      if (
        distance <= 0 ||
        !isLessThanDistance(x - startX, y - startY, distance)
      ) {

        onDragStart(_createArgs({ ctrlKey, shiftKey, metaKey, target }, x, y));
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

    const { x, y } = getPosition(target, mouseUpEvent);

    onDragEnd(_createArgs(mouseUpEvent, x, y));
    mouseUpEvent.preventDefault();
  };

  const _onMouseMove = mouseMoveEvent => {
    if (mouseMoveEvent.button !== button) return;

    const { x, y } = getPosition(target, mouseMoveEvent);
    if (!_tryDragStart(x, y)) {
      return; //drag distance not met
    }

    onDrag(_createArgs(mouseMoveEvent, x, y));
    mouseMoveEvent.preventDefault();
  };

  if (_tryDragStart(startX, startY)) {
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
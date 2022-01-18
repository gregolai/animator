import { noop } from 'common';

const isLessThanDistance = (deltaX, deltaY, distance) => {
	return deltaX * deltaX + deltaY * deltaY < distance * distance;
};

export const startDrag = (
	mouseDownEvent,
	{ distance = 0, measureTarget, onDragStart = noop, onDrag = noop, onDragEnd = noop }
) => {
	if (mouseDownEvent.persist) {
		mouseDownEvent.persist();
	}

	const { clientX: startX, clientY: startY, button } = mouseDownEvent;

	let isDragging = false;

	// cache rect
	const measureRect = measureTarget ? measureTarget.getBoundingClientRect() : undefined;

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

		if (measureRect) {
			obj.localX = clientX - measureRect.left;
			obj.localY = clientY - measureRect.top;
			obj.ratioX = obj.localX / measureRect.width;
			obj.ratioY = obj.localY / measureRect.height;
		}

		return obj;
	};

	const _tryDragStart = (e) => {
		if (!isDragging) {
			const { clientX, clientY } = e;
			if (distance <= 0 || !isLessThanDistance(clientX - startX, clientY - startY, distance)) {
				onDragStart(_createArgs(mouseDownEvent));
				isDragging = true;
			}
		}
		return isDragging;
	};

	const _onMouseUp = (mouseUpEvent) => {
		if (mouseUpEvent.button !== button) return;

		document.removeEventListener('mousemove', _onMouseMove);
		document.removeEventListener('mouseup', _onMouseUp);

		if (!isDragging) return; // distance hasn't been satisfied

		onDragEnd(_createArgs(mouseUpEvent));
		mouseUpEvent.preventDefault();
	};

	const _onMouseMove = (mouseMoveEvent) => {
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

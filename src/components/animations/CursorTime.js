import React from 'react';
import noop from 'lodash/noop';
import { normalizeRatio, PlaybackController } from 'utils';
import { AnimationStore, UIStore } from 'stores';

const Context = React.createContext();

const CursorTime = ({ children, animation }) => {
	const { animationCursor, setAnimationCursor, selectedInstanceId } = UIStore.use();
	const { isPlaying, playhead, setPlayhead } = PlaybackController.use();
	const { getInstance, getInstanceDefinitionValue } = AnimationStore.use();

	let easing;
	let cursorTime;
	let setCursorTime = noop;

	if (selectedInstanceId) {
		const instance = getInstance(selectedInstanceId);
		const delay = getInstanceDefinitionValue(instance.id, 'animationDelay');
		const duration = getInstanceDefinitionValue(instance.id, 'animationDuration');
		easing = getInstanceDefinitionValue(instance.id, 'animationTimingFunction');

		cursorTime = (playhead - delay) / duration;
		cursorTime = cursorTime < 0 || cursorTime > 1 ? undefined : normalizeRatio(cursorTime);

		setCursorTime = (ratio, _) => setPlayhead(delay + normalizeRatio(ratio) * duration);
	} else {
		easing = 'linear';
		cursorTime = animationCursor.ratio;
		setCursorTime = (ratio, isActive) => setAnimationCursor(ratio, isActive);
	}

	return <Context.Provider value={{ easing, cursorTime, setCursorTime }}>{children}</Context.Provider>;
};

CursorTime.use = () => React.useContext(Context);

export default CursorTime;

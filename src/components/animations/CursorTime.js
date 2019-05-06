import { React, normalizeRatio, noop } from 'common';
import { AnimationStore, UIStore } from 'stores';

const Context = React.createContext();

const CursorTime = ({ children }) => <Context.Consumer>{children}</Context.Consumer>;

CursorTime.Provider = ({ animation, children }) => (
  <UIStore.Consumer>
    {({ isPlaying, selectedInstanceId, playhead, setPlayhead, getLocalPlayhead, setLocalPlayhead }) => (
      <AnimationStore.Consumer>
        {({ getInstance, getInstanceDefinitionValue }) => {

          let easing;
          let cursorTime;
          let setCursorTime = noop;

          if (selectedInstanceId !== -1) {

            const instance = getInstance(selectedInstanceId);

            if (instance.animationId === animation.id) {
              const delay = getInstanceDefinitionValue(instance.id, 'animation-delay');
              const duration = getInstanceDefinitionValue(instance.id, 'animation-duration');
              easing = getInstanceDefinitionValue(instance.id, 'animation-timing-function');

              cursorTime = (playhead - delay) / duration;
              cursorTime = cursorTime < 0 || cursorTime > 1 ?
                undefined :
                normalizeRatio(cursorTime);

              // closure
              setCursorTime = ratio => setPlayhead(delay + normalizeRatio(ratio) * duration);
            }
          } else {
            const localPlayhead = getLocalPlayhead(animation.id);

            easing = 'linear';
            cursorTime = isPlaying ? undefined : localPlayhead;
            setCursorTime = ratio => setLocalPlayhead(animation.id, ratio);
          }

          return <Context.Provider value={{ easing, cursorTime, setCursorTime }}>{children}</Context.Provider>;
        }}
      </AnimationStore.Consumer>

    )}
  </UIStore.Consumer>
);

export default CursorTime;

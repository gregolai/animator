import { React, startDrag, normalizeRatio } from 'common';
import { AnimationStore, UIStore } from 'stores';
import { Canvas } from 'components/shared';

import styles from './PlayheadCursor.module.scss';

const drawLine = (ctx, x, lineWidth, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x - Math.floor(lineWidth / 2), 0, lineWidth, ctx.canvas.height);
}

const PlayheadCursor = ({ animation, height }) => {
  const [isDraggingLocalPlayhead, setDraggingLocalPlayhead] = React.useState(false);

  return (
    <UIStore.Consumer>
      {({ selectedInstanceId, isPlaying, playhead, setPlayhead, getLocalPlayhead, setLocalPlayhead }) => (
        <AnimationStore.Consumer>
          {({ getInstance, getInstances, getInstanceDefinitionValue }) => {
            const instances = getInstances(i => i.animationId === animation.id);

            const localPlayhead = getLocalPlayhead(animation.id);
            const isInstanceSelected = selectedInstanceId !== -1;

            return (
              <div
                className={styles.container}
                onMouseDown={e => {
                  const width = e.target.clientWidth;

                  const onDrag = ({ localX }) => {

                    if (selectedInstanceId === -1) {
                      setLocalPlayhead(animation.id, localX / width);
                    } else if (selectedInstanceId !== -1) {
                      const instance = getInstance(selectedInstanceId);
                      const delay = getInstanceDefinitionValue(instance.id, 'animation-delay');
                      const duration = getInstanceDefinitionValue(instance.id, 'animation-duration');

                      const ratio = normalizeRatio(localX / width);
                      setPlayhead(delay + ratio * duration);
                    }
                  }

                  startDrag(e, {
                    distance: 0,
                    measureLocalOffset: true,
                    onDragStart: ({ localX }) => {
                      setDraggingLocalPlayhead(true);
                      onDrag({ localX });
                    },
                    onDrag,
                    onDragEnd: () => setDraggingLocalPlayhead(false)
                  });
                }}
              >
                <div style={{ height }}>

                  <Canvas
                    onResize={({ cvs, ctx }) => {
                      const { width, height } = cvs;
                      ctx.clearRect(0, 0, width, height);

                      if (!isPlaying && !isInstanceSelected && localPlayhead !== undefined) {
                        const x = Math.floor(localPlayhead * width);
                        const lineWidth = isDraggingLocalPlayhead ? 3 : 1;
                        drawLine(ctx, x, lineWidth, 'blue');
                      }

                      instances.forEach(instance => {
                        const delay = getInstanceDefinitionValue(
                          instance.id,
                          'animation-delay'
                        );
                        if (playhead < delay) return;

                        const duration = getInstanceDefinitionValue(
                          instance.id,
                          'animation-duration'
                        );
                        if (playhead >= delay + duration) return;

                        const x = Math.floor(((playhead - delay) / duration) * width);
                        const lineWidth = selectedInstanceId === instance.id || isPlaying ?
                          3 :
                          1;
                        drawLine(ctx, x, lineWidth, 'black');
                      });
                    }}
                  />

                </div>
              </div>
            );
          }}
        </AnimationStore.Consumer>
      )}
    </UIStore.Consumer>
  );
};
export default PlayheadCursor;

import { React, startDrag, isNumber } from 'common';
import { AnimationStore, UIStore } from 'stores';
import { Canvas } from 'components/shared';

import PlaybackController from 'utils/PlaybackController';

import CursorTime from './CursorTime';
import styles from './PlayheadCursor.module.scss';

const drawLine = (ctx, x, lineWidth, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x - Math.floor(lineWidth / 2), 0, lineWidth, ctx.canvas.height);
}

const PlayheadCursor = ({ animation, height }) => {
  const [isDraggingLocalPlayhead, setDraggingLocalPlayhead] = React.useState(false);

  const { cursorTime, setCursorTime } = CursorTime.use();
  const { getInstances, getInstanceDefinitionValue } = AnimationStore.use();
  const { selectedInstanceId } = UIStore.use();

  const { isPlaying, playhead } = PlaybackController.use();

  const instances = getInstances(i => i.animationId === animation.id);
  const isInstanceSelected = selectedInstanceId !== -1;

  return (
    <div
      className={styles.container}
      onMouseDown={e => {
        startDrag(e, {
          distance: 0,
          measureTarget: e.currentTarget,
          onDragStart: ({ ratioX }) => {
            setDraggingLocalPlayhead(true);
            setCursorTime(ratioX, true);
          },
          onDrag: ({ ratioX }) => {
            setCursorTime(ratioX, true);
          },
          onDragEnd: ({ ratioX }) => {
            setCursorTime(ratioX, false);
            setDraggingLocalPlayhead(false)
          }
        });
      }}
    >
      <div style={{ height }}>

        <Canvas
          onResize={({ cvs, ctx }) => {
            const { width, height } = cvs;
            ctx.clearRect(0, 0, width, height);

            if (!isPlaying && !isInstanceSelected && isNumber(cursorTime)) {
              const x = Math.floor(cursorTime * width);
              const lineWidth = isDraggingLocalPlayhead ? 5 : 3;
              drawLine(ctx, x, lineWidth, 'dodgerblue');
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
};
export default PlayheadCursor;

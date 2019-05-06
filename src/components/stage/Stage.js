import { React, cx, roundToInterval, startDrag } from 'common';

import { AnimationStore, UIStore, StageStore } from 'stores';
import { Canvas, Hover } from 'components/shared';
import Controls from './components/Controls';

import { getDefinition } from 'utils/definitions';
import AnimationController from 'utils/AnimationController';

import styles from './Stage.scss';

const GRID_COLOR = '#f2f2f2';

const StageCanvas = () => (
  <StageStore.Consumer>
    {({ gridSize, showGrid }) => (
      <Canvas
        onResize={({ cvs, ctx }) => {
          ctx.clearRect(0, 0, cvs.width, cvs.height);
          if (!showGrid) return;

          const width = cvs.width;
          const height = cvs.height;

          /* eslint-disable no-lone-blocks */
          ctx.save();
          {
            ctx.beginPath();
            for (let x = gridSize; x <= width; x += gridSize) {
              ctx.moveTo(x + 0.5, 0);
              ctx.lineTo(x + 0.5, height);
            }

            for (let y = gridSize; y <= height; y += gridSize) {
              ctx.moveTo(0, y + 0.5);
              ctx.lineTo(width, y + 0.5);
            }
            ctx.closePath();

            ctx.lineWidth = 1;
            ctx.strokeStyle = GRID_COLOR;
            ctx.stroke();
          }
          ctx.restore();
        }}
      />
    )}
  </StageStore.Consumer>
);


const Instance = ({ instance }) => {
  const [isDragging, setDragging] = React.useState(false);



  return (
    <AnimationStore.Consumer>
      {({
        getKeyframes,
        getTweens,
        getInstanceDefinitionValue,
        setInstanceDefinitionValue
      }) => (
          <UIStore.Consumer>
            {({ setSelectedInstance, playhead }) => (
              <Hover>
                {({ hoverRef, isHovering }) => (
                  <AnimationController
                    format={true}
                    easing={getInstanceDefinitionValue(instance.id, 'animation-timing-function')}
                    delay={getInstanceDefinitionValue(instance.id, 'animation-delay')}
                    duration={getInstanceDefinitionValue(instance.id, 'animation-duration')}
                    keyframes={
                      getTweens(instance.animationId).reduce((map, tween) => {
                        map[tween.definitionId] = getKeyframes(tween.id);
                        return map;
                      }, {})
                    }
                    time={playhead}
                  >
                    {interpolatedStyles => (
                      <StageStore.Consumer>
                        {({ gridSize, gridSnap }) => (
                          <div
                            ref={hoverRef}
                            className={cx(styles.instance, {
                              [styles.dragging]: isDragging
                            })}
                            onMouseDown={event => {
                              if (event.button !== 0) return;

                              setSelectedInstance(instance.id);

                              const initX = getInstanceDefinitionValue(instance.id, 'left') || 0;
                              const initY = getInstanceDefinitionValue(instance.id, 'top') || 0;

                              startDrag(event, {

                                onDragStart: () => setDragging(true),
                                onDrag: ({ deltaX, deltaY }) => {
                                  let x = initX + deltaX;
                                  let y = initY + deltaY;
                                  if (gridSnap) {
                                    x = roundToInterval(x, gridSize);
                                    y = roundToInterval(y, gridSize);
                                  }
                                  console.log('onDrag', { x, y })
                                  setInstanceDefinitionValue(instance.id, 'left', x);
                                  setInstanceDefinitionValue(instance.id, 'top', y);
                                },
                                onDragEnd: () => setDragging(false),
                              })
                            }}
                            style={{
                              ...Object.keys(instance.definitionValues).reduce(
                                (style, definitionId) => {
                                  const definition = getDefinition(definitionId);
                                  const value = instance.definitionValues[definitionId];
                                  style[definition.styleName] = definition.format(value);
                                  return style;
                                },
                                {}
                              ),

                              ...interpolatedStyles
                            }}
                          >
                            {isHovering && <div className={styles.name}>{instance.name}</div>}
                          </div>
                        )}
                      </StageStore.Consumer>
                    )}
                  </AnimationController>
                )}
              </Hover>
            )}
          </UIStore.Consumer>

        )}
    </AnimationStore.Consumer>
  )
}

export default ({ className, showControls }) => {



  return (
    <div className={cx(styles.container, className)}>
      <StageCanvas />

      <AnimationStore.Consumer>
        {({ getInstances }) => (
          <div className={styles.instances}>
            {getInstances().map(instance => (
              <Instance
                key={instance.id}
                instance={instance}
              />
            ))}
          </div>
        )}
      </AnimationStore.Consumer>

      {showControls && <Controls />}
    </div>
  );
};

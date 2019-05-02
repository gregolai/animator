import { React, cx, roundToInterval, startDrag } from 'common';
import { AnimationStore, StageStore, UIStore } from 'stores';
import { getDefinition } from 'utils/definitions';
import { Hover } from 'components/shared';

import styles from './AnimInstance.scss';

const Inner = ({ anim, instance }) => {
  const [isDragging, setDragging] = React.useState(false);
  return (
    <AnimationStore.Consumer>
      {({
        interpolateInstance,
        getTweens,
        getInstanceDefinitionValue,
        setInstanceDefinitionValue
      }) => (
          <UIStore.Consumer>
            {({ setSelectedInstance, playhead, playheadToRatio }) => (
              <Hover>
                {({ hoverRef, isHovering }) => (
                  <StageStore.Consumer>
                    {({ gridSize, gridSnap }) => {
                      return (
                        <div
                          className={cx(styles.container, {
                            [styles.dragging]: isDragging
                          })}
                        >
                          <div
                            ref={hoverRef}
                            className={styles.inner}
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

                              ...getTweens(anim.id).reduce((style, tween) => {
                                const value = interpolateInstance(
                                  instance.id,
                                  tween.id,
                                  playhead
                                );
                                if (value !== undefined) {
                                  const definition = getDefinition(tween.definitionId);
                                  style[definition.styleName] = definition.format(value);
                                }
                                return style;
                              }, {})
                            }}
                          >
                            {isHovering && <div className={styles.name}>{instance.name}</div>}
                          </div>
                        </div>
                      );
                    }}
                  </StageStore.Consumer>
                )}
              </Hover>
            )}
          </UIStore.Consumer>
        )}
    </AnimationStore.Consumer>
  );
};

const AnimInstance = ({ instance }) => (
  <AnimationStore.Consumer>
    {({ getAnimation }) => <Inner anim={getAnimation(instance.animationId)} instance={instance} />}
  </AnimationStore.Consumer>
);

export default AnimInstance;

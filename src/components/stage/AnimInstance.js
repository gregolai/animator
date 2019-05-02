import React from 'react';
import classnames from 'classnames';

import { roundToInterval } from 'common';
import { AnimationStore, MediaStore, StageStore, UIStore } from 'stores';
import { getDefinition } from 'utils/definitions';
import { Drag, Hover } from 'components/shared';

import styles from './AnimInstance.scss';

const Inner = ({ anim, instance }) => (
  <AnimationStore.Consumer>
    {({
      interpolateInstance,
      getTweens,
      getInstanceDefinitionValue,
      setInstanceDefinitionValue
    }) => (
      <UIStore.Consumer>
        {({ setSelectedInstance }) => (
          <Hover>
            {({ hoverRef, isHovering }) => (
              <Drag>
                {({ isDragging, startDrag }) => (
                  <StageStore.Consumer>
                    {({ gridSize, gridSnap }) => (
                      <MediaStore.Consumer>
                        {({ playhead }) => (
                          <div
                            className={classnames(styles.container, {
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
                                startDrag({
                                  event,
                                  onUpdate: ({ deltaX, deltaY }) => {
                                    let x = initX + deltaX;
                                    let y = initY + deltaY;
                                    if (gridSnap) {
                                      x = roundToInterval(x, gridSize);
                                      y = roundToInterval(y, gridSize);
                                    }

                                    setInstanceDefinitionValue(instance.id, 'left', x);
                                    setInstanceDefinitionValue(instance.id, 'top', y);
                                  }
                                });
                              }}
                              style={{
                                position: 'absolute',
                                width: 30,
                                height: 30,
                                backgroundColor: 'blue',

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
                        )}
                      </MediaStore.Consumer>
                    )}
                  </StageStore.Consumer>
                )}
              </Drag>
            )}
          </Hover>
        )}
      </UIStore.Consumer>
    )}
  </AnimationStore.Consumer>
);

const AnimInstance = ({ instance }) => (
  <AnimationStore.Consumer>
    {({ getAnimation }) => <Inner anim={getAnimation(instance.animId)} instance={instance} />}
  </AnimationStore.Consumer>
);

export default AnimInstance;

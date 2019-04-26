import React from 'react';
import classnames from 'classnames';

import { AnimationStore, MediaStore, StageStore, UIStore } from 'stores';
import { getDefinition } from 'utils/definitions';
import Drag from 'components/shared/Drag';

import styles from './AnimInstance.scss';

const Inner = ({ anim, instance }) => (
  <AnimationStore.Consumer>
    {({ interpolate, getTweens }) => (
      <UIStore.Consumer>
        {({ setSelectedInstance }) => (
          <Drag>
            {({ isDragging, startDrag }) => (
              <StageStore.Consumer>
                {({ getInstanceDefinitionValue, setInstanceDefinitionValue }) => (

                  <MediaStore.Consumer>
                    {({ playhead }) => (
                      <div
                        className={classnames(styles.container, {
                          [styles.dragging]: isDragging
                        })}
                      >
                        <div
                          className={styles.inner}
                          onMouseDown={event => {
                            if (event.button !== 0) return;

                            setSelectedInstance(instance.id);

                            const initX = getInstanceDefinitionValue(instance.id, 'left') || 0;
                            const initY = getInstanceDefinitionValue(instance.id, 'top') || 0;
                            startDrag({
                              event,
                              onUpdate: ({ deltaX, deltaY }) => {
                                setInstanceDefinitionValue(instance.id, 'left', initX + deltaX);
                                setInstanceDefinitionValue(instance.id, 'top', initY + deltaY);
                              }
                            })
                          }}
                          style={{
                            position: 'absolute',
                            width: 30,
                            height: 30,
                            backgroundColor: 'blue',

                            ...Object.keys(instance.definitionValues).reduce((style, definitionId) => {
                              const definition = getDefinition(definitionId);
                              const value = instance.definitionValues[definitionId];
                              style[definition.styleName] = definition.format(value);
                              return style;
                            }, {}),

                            ...getTweens(anim.id).reduce((style, tween) => {
                              const value = interpolate(tween.id, playhead);
                              if (value !== undefined) {
                                const definition = getDefinition(tween.definitionId);
                                style[definition.styleName] = definition.format(value);
                              }
                              return style;
                            }, {})
                          }}
                        />
                      </div>
                    )}
                  </MediaStore.Consumer>
                )}
              </StageStore.Consumer>
            )}
          </Drag>
        )}
      </UIStore.Consumer>
    )}
  </AnimationStore.Consumer>
)

const AnimInstance = ({ instance }) => (
  <AnimationStore.Consumer>
    {({ getAnimation }) => (
      <Inner
        anim={getAnimation(instance.animId)}
        instance={instance}
      />
    )}
  </AnimationStore.Consumer>
)

export default AnimInstance;
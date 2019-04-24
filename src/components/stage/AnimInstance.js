import React from 'react';
import classnames from 'classnames';

import { AnimationStore, MediaStore, UIStore } from 'stores';

import Drag from '../shared/Drag';

import styles from './AnimInstance.scss';

const AnimInstance = ({ anim, tweens }) => (
  <UIStore.Consumer>
    {({ setSelectedAnim }) => (
      <AnimationStore.Consumer>
        {({ interpolate, setAnimationOffset }) => (
          <Drag>
            {({ isDragging, onDragStart }) => (
              <MediaStore.Consumer>
                {({ playhead }) => (
                  <div
                    className={classnames(styles.container, {
                      [styles.dragging]: isDragging
                    })}
                    style={{
                      top: anim.offset.y,
                      left: anim.offset.x
                    }}
                  >
                    <div
                      className={styles.inner}
                      onMouseDown={e => {
                        if (e.button !== 0) return;

                        setSelectedAnim(anim.id);

                        const init = anim.offset;
                        onDragStart(e, ({ deltaX, deltaY }) => {
                          setAnimationOffset(anim.id, {
                            x: init.x + deltaX,
                            y: init.y + deltaY
                          });
                        })
                      }}
                      style={{
                        width: 30,
                        height: 30,
                        backgroundColor: 'blue',
                        ...tweens.reduce((style, tween) => {
                          const value = interpolate(tween.id, playhead);
                          if (value !== undefined) {
                            style[tween.definition.name] = value;
                          }
                          return style;
                        }, {})
                      }}
                    />
                  </div>
                )}
              </MediaStore.Consumer>
            )}
          </Drag>
        )}
      </AnimationStore.Consumer>
    )}
  </UIStore.Consumer>
)

export default AnimInstance;
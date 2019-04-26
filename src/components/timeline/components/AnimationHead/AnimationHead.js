import React from 'react';
import classnames from 'classnames';

import { AnimationStore, UIStore } from 'stores';

import { Icon, IconButton } from 'components/core';

import AddDropdown from 'components/shared/AddDropdown';
import Hover from 'components/shared/Hover';
import ExpandingTitle from 'components/shared/ExpandingTitle';

import styles from './AnimationHead.scss';

const DeleteButton = ({ onClick, enabled }) => (
  <IconButton
    className={classnames(styles.delete, {
      [styles.hidden]: !enabled
    })}
    isDisabled={!enabled}
    onClick={onClick}
  >
    <Icon name="close" />
  </IconButton>
)

const AnimationHead = ({ anim }) => {

  return (
    <UIStore.Consumer>
      {({ setSelectedAnim }) => (
        <AnimationStore.Consumer>
          {({ createTween, deleteAnimation, getUnusedPropDefinitions }) => (
            <Hover>
              {({ hoverRef, isHovering }) => (
                <div className={styles.container}>
                  <ExpandingTitle
                    ref={hoverRef}
                    className={styles.title}
                    isExpanded={false}
                    label={anim.name}
                    onClick={() => { }}
                    accessory={
                      <DeleteButton
                        enabled={isHovering}
                        onClick={() => {
                          const { animIndex, animations } = deleteAnimation(anim.id);

                          const nextAnim = animations[animIndex] || animations[animIndex - 1];
                          setSelectedAnim(nextAnim ? nextAnim.id : -1);
                        }}
                      />
                    }
                  />
                  <AddDropdown
                    onSelect={definitionId => {
                      createTween(anim.id, definitionId);
                    }}
                    options={
                      getUnusedPropDefinitions(anim.id).map(definition => ({
                        label: definition.id,
                        value: definition.id,
                      }))
                    }
                  />
                </div>
              )}
            </Hover>
          )}
        </AnimationStore.Consumer>
      )}
    </UIStore.Consumer>
  );
}

export default AnimationHead;
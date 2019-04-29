import React from 'react';
import classnames from 'classnames';

import { AnimationStore } from 'stores';

import { Icon, IconButton } from 'components/core';

import { AddDropdown, Hover, ExpandingTitle } from 'components/shared';

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
                    onClick={() => deleteAnimation(anim.id)}
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
  );
}

export default AnimationHead;
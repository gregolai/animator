import React from 'react';

import { AnimationStore } from 'stores';

import { AddDropdown, IconButton, ExpandingTitle } from 'components/shared';

import styles from './AnimationHead.module.scss';

const AnimationHead = ({ anim }) => {
  return (
    <AnimationStore.Consumer>
      {({ createTween, deleteAnimation, getUnusedPropDefinitions }) => (
        <div className={styles.container}>
          <ExpandingTitle
            className={styles.title}
            isExpanded={false}
            label={anim.name}
            onClick={() => {}}
            accessory={
              <IconButton
                icon="close"
                onClick={() => deleteAnimation(anim.id)}
              />
            }
          />
          <AddDropdown
            className={styles.btnAddTween}
            label="Add Tween"
            onSelect={definitionId => {
              createTween(anim.id, definitionId);
            }}
            options={getUnusedPropDefinitions(anim.id).map(definition => ({
              label: definition.id,
              value: definition.id
            }))}
          />
        </div>
      )}
    </AnimationStore.Consumer>
  );
};

export default AnimationHead;

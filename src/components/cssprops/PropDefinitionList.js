import React from 'react';
import classnames from 'classnames';

import { ContextField, DisclosureField } from 'components/core';
import { AnimationStore, UIStore } from 'stores';

import styles from './PropDefinitionList.scss';

const PropDefinitionList = ({ className }) => (
  <UIStore.Consumer>
    {({ selectedAnimId }) => (
      <AnimationStore.Consumer>
        {({ createTween, getUnusedPropDefinitions }) => (
          <div className={classnames(styles.container, {
            [styles.hidden]: selectedAnimId === -1
          }, className)}>
            <ContextField
              className={styles.label}
              label="Tween Definitions"
              fieldIndex={0}
            />
            <div className={styles.list}>
              {getUnusedPropDefinitions(selectedAnimId).map(def => (
                <DisclosureField
                  key={def.name}
                  hoverable
                  label={def.name}
                  onClick={() => createTween(selectedAnimId, def.name)}
                />
              ))}
            </div>
          </div>
        )}
      </AnimationStore.Consumer>
    )}
  </UIStore.Consumer>
);

export default PropDefinitionList;
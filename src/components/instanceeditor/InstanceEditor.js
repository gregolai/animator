import React from 'react';
import { AnimationStore, StageStore, UIStore } from 'stores';
import { ContextField, DropdownSelect } from 'components/core';
import { getDefinitions } from 'utils/definitions';
import ExpandingTitle from 'components/shared/ExpandingTitle';
import ValueButton from 'components/shared/ValueButton';

import styles from './InstanceEditor.scss';

const Instance = ({ instance }) => (
  <UIStore.Consumer>
    {({ selectedInstanceId, setSelectedInstance }) => (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ExpandingTitle
            accessory={undefined}
            isExpanded={selectedInstanceId === instance.id}
            label={instance.name}
            onClick={() => setSelectedInstance(instance.id)}
          />
          <div style={{ minWidth: 220 }}>
            <ContextField fieldIndex={0} label="Animation" />
            <AnimationStore.Consumer>
              {({ getAnimations }) => (

                <StageStore.Consumer>
                  {({ setInstanceAnimation }) => (
                    <DropdownSelect
                      placeholder="Animation"
                      onChange={animId => setInstanceAnimation(instance.id, animId)}
                      options={
                        getAnimations()
                          .map(anim => ({
                            label: anim.name,
                            value: anim.id
                          }))
                      }
                      value={instance.animId}
                    />
                  )}
                </StageStore.Consumer>
              )}
            </AnimationStore.Consumer>
          </div>
        </div>
        {selectedInstanceId === instance.id && (


          <div className={styles.definitions}>
            {getDefinitions().map(definition => (
              <ValueButton
                key={definition.id}
                className={styles.definition}
                definition={definition}
                isToggled={false}
                onClick={() => { }}
                value={instance.definitionValues[definition.id]}
              />
            ))}
          </div>
        )}
      </div>
    )}
  </UIStore.Consumer>
);

const InstanceEditor = () => {
  return (
    <StageStore.Consumer>
      {({ getInstances }) => (
        <div>
          {getInstances().map(instance => (
            <Instance
              key={instance.id}
              instance={instance}
            />
          ))}
        </div>
      )}
    </StageStore.Consumer>
  );
};
export default InstanceEditor;
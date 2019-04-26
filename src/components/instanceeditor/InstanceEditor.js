import React from 'react';
import { AnimationStore, StageStore, UIStore } from 'stores';
import { Dropdown } from 'components/basic';
import { getDefinitions } from 'utils/definitions';
import ValueButton from 'components/shared/ValueButton';

const Instance = ({ instance, isSelected }) => (
  <div>
    <div>{instance.name} {isSelected ? '*' : ''}</div>
    <div>
      <AnimationStore.Consumer>
        {({ getAnimations }) => (

          <StageStore.Consumer>
            {({ setInstanceAnimation }) => (
              <Dropdown
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
    <div>
      {getDefinitions().map(definition => (
        <ValueButton
          key={definition.id}
          definition={definition}
          isToggled={false}
          onClick={() => { }}
          value={instance.definitionValues[definition.id]}
        />
      ))}
    </div>
  </div>
);

const InstanceEditor = () => {

  return (
    <UIStore.Consumer>
      {({ selectedInstanceId }) => (
        <StageStore.Consumer>
          {({ getInstances }) => (
            <div>
              {getInstances().map(instance => (
                <Instance
                  key={instance.id}
                  instance={instance}
                  isSelected={selectedInstanceId === instance.id}
                />
              ))}
            </div>
          )}
        </StageStore.Consumer>
      )}
    </UIStore.Consumer>
  );
};
export default InstanceEditor;
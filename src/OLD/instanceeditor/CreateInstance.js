import React from 'react';
import { AnimationStore, UIStore } from 'stores';

import { AddDropdown } from 'components/shared';

const CreateInstance = () => {
  return (
    <div style={{ display: 'flex' }}>
      <UIStore.Consumer>
        {({ setSelectedInstance }) => (
          <AnimationStore.Consumer>
            {({ createInstance, getAnimations }) => {
              const animations = getAnimations();
              if (animations.length === 0) return null;

              return (
                <AddDropdown
                  label="Create Instance"
                  options={animations.map(anim => ({
                    label: anim.name,
                    value: anim.id
                  }))}
                  onSelect={animId => {
                    const instance = createInstance({ animId });
                    setSelectedInstance(instance.id);
                  }}
                />
              );
            }}
          </AnimationStore.Consumer>
        )}
      </UIStore.Consumer>
    </div>
  );
};

export default CreateInstance;

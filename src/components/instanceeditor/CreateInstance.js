import React from 'react';
import { AnimationStore, StageStore } from 'stores';

import AddDropdown from 'components/shared/AddDropdown';

const CreateInstance = () => {
  return (
    <div style={{ display: 'flex' }}>
      <StageStore.Consumer>
        {({ createInstance }) => (
          <AnimationStore.Consumer>
            {({ getAnimations }) => (
              <AddDropdown
                label="Create Instance"
                options={
                  getAnimations()
                    .map(anim => ({
                      label: anim.name,
                      value: anim.id
                    }))
                }
                onSelect={animId => {
                  createInstance({ animId });
                }}
              />
            )}
          </AnimationStore.Consumer>
        )}
      </StageStore.Consumer>
    </div>
  );
}

export default CreateInstance;
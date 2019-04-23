import React from 'react';
import AnimationStore from './AnimationStore';
import ImporterStore from './ImporterStore';
import MediaStore from './MediaStore';
import StageStore from './StageStore';
import UIStore from './UIStore';

export const withStores = Component => props => (
  <ImporterStore>
    <AnimationStore>
      <MediaStore>
        <UIStore>
          <StageStore>
            <Component {...props} />
          </StageStore>
        </UIStore>
      </MediaStore>
    </AnimationStore>
  </ImporterStore>
);

export {
  AnimationStore,
  ImporterStore,
  MediaStore,
  StageStore,
  UIStore
}



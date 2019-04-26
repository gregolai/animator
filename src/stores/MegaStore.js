
import React from 'react';
import { createPersist } from 'utils/persist';

const persist = createPersist('MegaStore', {
  animation: {
    animations: [],
    instances: [],
    keyframes: [],
    tweens: [],
  },

  importer: {
    isOpen: false,
    replace: false
  },

  media: {
    duration: 3000,
    isLooping: true,
    isReversed: false,
    playhead: 0
  },

  stage: {
    gridSize: 22,
    showGrid: true
  },

  user: {
    expandedTweenId: -1,
    hiddenTweens: {},
    lockedTweens: {},
    selectedAnimId: -1,
    selectedInstanceId: -1
  }
})

const INITIAL_STATE = {
  animation: {
    animations: persist.animation.animations.read(),
    instances: persist.animation.instances.read(),
    keyframes: persist.animation.keyframes.read(),
    tweens: persist.animation.tweens.read(),
  },

  importer: {
    isOpen: persist.importer.isOpen.read(),
    replace: persist.importer.replace.read(),
    canImport: false,
    value: '',
    errors: [],
    warnings: [],
  },

  media: {
    duration: persist.media.duration.read(),
    isLooping: persist.media.isLooping.read(),
    isPlaying: false,
    isReversed: persist.media.isReversed.read(),
    playhead: persist.media.playhead.read()
  },

  stage: {
    gridSize: persist.stage.gridSize.read(),
    showGrid: persist.stage.showGrid.read()
  },

  user: {
    expandedTweenId: persist.expandedTweenId.read(),
    hiddenTweens: persist.hiddenTweens.read(),
    lockedTweens: persist.lockedTweens.read(),
    selectedAnimId: persist.selectedAnimId.read(),
    selectedInstanceId: persist.selectedInstanceId.read()
  }
}

const Context = React.createContext(INITIAL_STATE);
export default class MagaStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  render() {
    return null;
  }
}
import React from 'react';
import { createPersist } from 'utils/persist';

const persist = createPersist('UIStore', {
  expandedTweenId: -1,
  hiddenTweens: {},
  lockedTweens: {},
  selectedAnimId: -1
});

const INITIAL_STATE = {
  expandedTweenId: persist.expandedTweenId.read(),
  hiddenTweens: persist.hiddenTweens.read(),
  lockedTweens: persist.lockedTweens.read(),
  selectedAnimId: persist.selectedAnimId.read(),
}

const Context = React.createContext(INITIAL_STATE);
export default class UIStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  setSelectedAnim = animId => {
    const selectedAnimId = animId;

    this.setState({ selectedAnimId });
    persist.selectedAnimId.write(selectedAnimId);
  }

  isAnimationSelected = animId => {
    return this.state.selectedAnimId === animId;
  }

  isTweenExpanded = tweenId => {
    return this.state.expandedTweenId === tweenId;
  }

  setTweenExpanded = (tweenId, expand) => {
    const expandedTweenId = expand ? tweenId : -1;

    this.setState({ expandedTweenId });
    persist.expandedTweenId.write(expandedTweenId);
  }

  isTweenHidden = tweenId => {
    return !!this.state.hiddenTweens[tweenId];
  }

  setTweenHidden = (tweenId, hide) => {
    const hiddenTweens = { ...this.state.hiddenTweens };

    if (hide) {
      hiddenTweens[tweenId] = true;
    } else {
      delete hiddenTweens[tweenId];
    }

    this.setState({ hiddenTweens });
    persist.hiddenTweens.write(hiddenTweens);
  }

  isTweenLocked = tweenId => {
    return !!this.state.lockedTweens[tweenId];
  }

  setTweenLocked = (tweenId, lock) => {
    const lockedTweens = { ...this.state.lockedTweens };

    if (lock) {
      lockedTweens[tweenId] = true;
    } else {
      delete lockedTweens[tweenId];
    }

    this.setState({ lockedTweens });
    persist.lockedTweens.write(lockedTweens);
  }

  render() {
    return (
      <Context.Provider
        value={{
          selectedAnimId: this.state.selectedAnimId,
          setSelectedAnim: this.setSelectedAnim,
          isAnimationSelected: this.isAnimationSelected,

          isTweenExpanded: this.isTweenExpanded,
          setTweenExpanded: this.setTweenExpanded,

          isTweenHidden: this.isTweenHidden,
          setTweenHidden: this.setTweenHidden,

          isTweenLocked: this.isTweenLocked,
          setTweenLocked: this.setTweenLocked,
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}
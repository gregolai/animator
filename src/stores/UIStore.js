import React from 'react';
import { createPersist } from 'utils/persist';

const persist = createPersist('UIStore', {
  expandedTweenId: -1,
  hiddenTweens: {},
  lockedTweens: {},
  selectedInstanceId: -1
});

const Context = React.createContext();
export default class UIStore extends React.Component {
  static Consumer = Context.Consumer;

  state = {
    expandedTweenId: persist.expandedTweenId.read(),
    hiddenTweens: persist.hiddenTweens.read(),
    lockedTweens: persist.lockedTweens.read(),
    selectedInstanceId: persist.selectedInstanceId.read()
  };

  setSelectedInstance = instanceId => {
    const selectedInstanceId = instanceId;

    this.setState({ selectedInstanceId });
    persist.selectedInstanceId.write(selectedInstanceId);
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
          selectedInstanceId: this.state.selectedInstanceId,
          setSelectedInstance: this.setSelectedInstance,

          isTweenExpanded: this.isTweenExpanded,
          setTweenExpanded: this.setTweenExpanded,

          isTweenHidden: this.isTweenHidden,
          setTweenHidden: this.setTweenHidden,

          isTweenLocked: this.isTweenLocked,
          setTweenLocked: this.setTweenLocked
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}
import React from 'react';

const INITIAL_STATE = {
  expandedTweenId: -1,
  hiddenTweens: {},
  lockedTweens: {},
  selectedAnimId: -1,
}

const Context = React.createContext(INITIAL_STATE);
export default class UIStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  setSelectedAnim = animId => {
    this.setState({ selectedAnimId: animId });
  }

  isAnimationSelected = animId => {
    return this.state.selectedAnimId === animId;
  }

  isTweenExpanded = tweenId => {
    return this.state.expandedTweenId === tweenId;
  }

  setTweenExpanded = (tweenId, expand) => {
    this.setState({
      expandedTweenId: expand ? tweenId : -1
    });
  }

  isTweenHidden = tweenId => {
    return !!this.state.hiddenTweens[tweenId];
  }

  setHiddenTween = (tweenId, hide) => {
    const hiddenTweens = { ...this.state.hiddenTweens };

    if (hide) {
      hiddenTweens[tweenId] = true;
    } else {
      delete hiddenTweens[tweenId];
    }

    this.setState({ hiddenTweens });
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
          setHiddenTween: this.setHiddenTween,

          isTweenLocked: this.isTweenLocked,
          setTweenLocked: this.setTweenLocked,
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}
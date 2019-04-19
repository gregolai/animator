import React from 'react';

const INITIAL_STATE = {
  expandedTweenId: -1,
  selectedAnimId: -1,
}

const Context = React.createContext(INITIAL_STATE);
export default class UIStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  setExpandedTween = tweenId => {
    this.setState({ expandedTweenId: tweenId });
  }

  setSelectedAnim = animId => {
    this.setState({ selectedAnimId: animId });
  }

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,

          setExpandedTween: this.setExpandedTween,
          setSelectedAnim: this.setSelectedAnim
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}
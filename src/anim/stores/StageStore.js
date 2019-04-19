import React from 'react';

const INITIAL_STATE = {
  gridSize: 22,
  showGrid: true,
}

const Context = React.createContext(INITIAL_STATE);
export default class StageStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  setGridSize = gridSize => {
    this.setState({ gridSize })
  };

  setShowGrid = showGrid => {
    this.setState({ showGrid })
  }

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          setGridSize: this.setGridSize,
          setShowGrid: this.setShowGrid
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}
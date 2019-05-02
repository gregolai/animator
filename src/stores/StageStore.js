import React from 'react';
import { createPersist } from 'utils/persist';

const persist = createPersist('StageStore', {
  gridSize: 22,
  showGrid: true,
  gridSnap: false
});

const Context = React.createContext();
export default class StageStore extends React.Component {
  static Consumer = Context.Consumer;

  state = {
    gridSize: persist.gridSize.read(),
    showGrid: persist.showGrid.read(),
    gridSnap: persist.gridSnap.read()
  };

  setGridSize = gridSize => {
    this.setState({ gridSize });
    persist.gridSize.write(gridSize);
  };

  setShowGrid = showGrid => {
    this.setState({ showGrid });
    persist.showGrid.write(showGrid);
  };

  setGridSnap = gridSnap => {
    this.setState({ gridSnap });
    persist.gridSnap.write(gridSnap);
  };

  render() {
    const { gridSize, showGrid, gridSnap } = this.state;

    return (
      <Context.Provider
        value={{
          gridSize,
          setGridSize: this.setGridSize,

          showGrid,
          setShowGrid: this.setShowGrid,

          gridSnap,
          setGridSnap: this.setGridSnap
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

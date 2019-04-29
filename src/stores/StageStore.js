import React from 'react';
import db from 'utils/db';
import { createPersist } from 'utils/persist';

const persist = createPersist('StageStore', {
  gridSize: 22,
  instances: [],
  showGrid: true,
  gridSnap: false
})

const INITIAL_STATE = {
  gridSize: persist.gridSize.read(),
  instances: persist.instances.read(),
  showGrid: persist.showGrid.read(),
  gridSnap: persist.gridSnap.read()
}

const Context = React.createContext(INITIAL_STATE);
export default class StageStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  setGridSize = gridSize => {
    this.setState({ gridSize })
    persist.gridSize.write(gridSize);
  };

  setShowGrid = showGrid => {
    this.setState({ showGrid })
    persist.showGrid.write(showGrid);
  }

  setGridSnap = gridSnap => {
    this.setState({ gridSnap });
    persist.gridSnap.write(gridSnap);
  }

  getInstance = instanceId => {
    return db.getOne(this.state.instances, instanceId).item;
  }

  getInstances = () => {
    return [...this.state.instances];
  }

  render() {
    const {
      gridSize,
      showGrid,
      gridSnap
    } = this.state;

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
    )
  }
}
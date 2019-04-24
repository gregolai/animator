import React from 'react';
import { uniqueNamesGenerator } from 'unique-names-generator';
import db from 'utils/db';
import { createPersist } from 'utils/persist';

const persist = createPersist('StageStore', {
  gridSize: 22,
  instances: [],
  showGrid: true
})

const INITIAL_STATE = {
  gridSize: persist.gridSize.read(),
  instances: persist.instances.read(),
  showGrid: persist.showGrid.read(),
}

const Context = React.createContext(INITIAL_STATE);
export default class StageStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  createInstance = ({ animId }) => {
    const { list: instances, item, index } = db.createOne(this.state.instances, {
      name: uniqueNamesGenerator('-', true),
      animId
    });

    this.setState({ instances });
    persist.instances.write(instances);

    return {
      instance: item,
      instanceIndex: index
    }
  }

  deleteInstance = (instanceId) => {
    const { list: instances, item, index } = db.deleteOne(this.state.instances, instanceId);

    this.setState({ instances });

    return {
      instance: item,
      instanceIndex: index
    }
  }

  setGridSize = gridSize => {
    this.setState({ gridSize })
    persist.gridSize.write(gridSize);
  };

  setShowGrid = showGrid => {
    this.setState({ showGrid })
    persist.showGrid.write(showGrid);
  }

  getInstances = () => {
    return [...this.state.instances];
  }

  getInstance = instanceId => {
    return db.getOne(this.state.instances, instanceId).item;
  }

  render() {
    const {
      gridSize,
      showGrid
    } = this.state;

    return (
      <Context.Provider
        value={{
          gridSize,
          showGrid,

          setGridSize: this.setGridSize,
          setShowGrid: this.setShowGrid,

          createInstance: this.createInstance,
          getInstances: this.getInstances,
          getInstance: this.getInstance
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}
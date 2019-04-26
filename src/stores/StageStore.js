import React from 'react';
import { uniqueNamesGenerator } from 'unique-names-generator';
import db from 'utils/db';
import { createPersist } from 'utils/persist';
import { getDefinition } from 'utils/definitions';

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

const createInstance = ({ animId, name = '' }) => {
  return {
    animId,
    definitionValues: {},
    name: name || uniqueNamesGenerator('-', true)
  }
}

const Context = React.createContext(INITIAL_STATE);
export default class StageStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  createInstance = ({ animId }) => {
    const { list: instances, item, index } = db.createOne(this.state.instances,
      createInstance({ animId })
    );

    this.setState({ instances });
    persist.instances.write(instances);

    return {
      instance: item,
      instanceIndex: index
    }
  }

  setInstanceAnimation = (instanceId, animId) => {
    const { list: instances, item, index } = db.setOne(this.state.instances, instanceId, { animId });

    this.setState({ instances });
    persist.instances.write(instances);

    return {
      instance: item,
      instanceIndex: index
    }
  };

  getInstanceDefinitionValue = (instanceId, definitionId) => {
    const instance = this.getInstance(instanceId);
    const definition = getDefinition(definitionId);

    if (!instance || !definition) {
      return undefined;
    }

    return instance.definitionValues[definitionId];
  };

  setInstanceDefinitionValue = (instanceId, definitionId, value) => {
    const instance = this.getInstance(instanceId);
    const definition = getDefinition(definitionId);

    if (!instance || !definition) {
      return;
    }

    const { list: instances } = db.setOne(this.state.instances, instanceId, {
      ...instance,
      definitionValues: {
        ...instance.definitionValues,
        [definitionId]: value
      }
    });

    this.setState({ instances });
    persist.instances.write(instances);
  };

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

  getInstances = () => {
    return [...this.state.instances];
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
          setInstanceAnimation: this.setInstanceAnimation,
          getInstances: this.getInstances,
          getInstance: this.getInstance,

          getInstanceDefinitionValue: this.getInstanceDefinitionValue,
          setInstanceDefinitionValue: this.setInstanceDefinitionValue,
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}
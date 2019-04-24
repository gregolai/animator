import React from 'react';
import { uniqueNamesGenerator } from 'unique-names-generator';
import db from '../utils/db';

const INITIAL_STATE = {
  gridSize: 22,
  instances: [],
  showGrid: true,
}

const createInstance = ({ name = undefined, animId }) => {
  return {
    name: name || uniqueNamesGenerator('-', true),
    animId,
  }
}

const Context = React.createContext(INITIAL_STATE);
export default class StageStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  createInstance = ({ animId }) => {
    const { list: instances, item, index } = db.createOne(this.state.instances, createInstance({
      animId
    }));

    this.setState({ instances });

    return {
      instance: item,
      instanceIndex: index
    }
  }

  setGridSize = gridSize => {
    this.setState({ gridSize })
  };

  setShowGrid = showGrid => {
    this.setState({ showGrid })
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

          createInstance: this.createInstance
        }}
      >
        {this.props.children}
      </Context.Provider>
    )
  }
}
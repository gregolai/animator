import { React, normalizeRatio } from 'utils';

const Context = React.createContext();

export default class LocalPlayheadStore extends React.Component {
  static Consumer = Context.Consumer;

  state = {
    localPlayhead: 0
  }

  setLocalPlayhead = localPlayhead => {
    localPlayhead = normalizeRatio(localPlayhead);
    this.setState({ localPlayhead });
  }

  render() {
    return (
      <Context.Provider
        value={{
          localPlayhead: this.state.localPlayhead,
          setLocalPlayhead: this.setLocalPlayhead
        }}
      >{this.props.children}</Context.Provider>
    );
  }
}
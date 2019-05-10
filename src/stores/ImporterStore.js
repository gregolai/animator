import React from 'react';
import { CSSLint } from 'csslint';
import { createPersist } from 'utils/persist';

const lint = cssString => {
  const { messages } = CSSLint.verify(cssString);
  const warnings = messages.filter(v => v.type === 'warning');
  const errors = messages.filter(v => v.type === 'error');
  return { warnings, errors };
};

const persist = createPersist('ImporterStore', {
  isOpen: false,
  replace: false
});

const Context = React.createContext();
export default class ImporterStore extends React.Component {

  static use = () => React.useContext(Context);

  state = {
    isOpen: persist.isOpen.read(),
    replace: persist.replace.read(),
    canImport: false,
    value: '',
    errors: [],
    warnings: []
  };

  setReplace = replace => {
    this.setState({ replace });
    persist.replace.write(replace);
  };

  setOpen = isOpen => {
    this.setState({ isOpen });
    persist.isOpen.write(isOpen);
  };

  setValue = value => {
    const { errors, warnings } = lint(value);
    this.setState({
      canImport: errors.length === 0,
      errors,
      warnings,
      value
    });
  };

  render() {
    const { replace, canImport, isOpen, value, errors, warnings } = this.state;

    return (
      <Context.Provider
        value={{
          replace,
          canImport,
          isOpen,
          value,
          errors,
          warnings,

          setReplace: this.setReplace,
          setOpen: this.setOpen,
          setValue: this.setValue
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

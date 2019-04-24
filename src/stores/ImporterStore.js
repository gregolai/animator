import React from 'react';
import { CSSLint } from 'csslint';

const lint = cssString => {
  const { messages } = CSSLint.verify(cssString);
  const warnings = messages.filter(v => v.type === 'warning');
  const errors = messages.filter(v => v.type === 'error');
  return { warnings, errors }
}

const INITIAL_STATE = {
  replace: false,
  canImport: false,
  isOpen: false,
  value: '',
  errors: [],
  warnings: [],
}

const Context = React.createContext(INITIAL_STATE);
export default class ImporterStore extends React.Component {
  static Consumer = Context.Consumer;

  state = INITIAL_STATE;

  setReplace = replace => {
    this.setState({ replace });
  }

  setOpen = isOpen => {
    this.setState({ isOpen });
  }

  setValue = value => {
    const { errors, warnings } = lint(value);
    this.setState({
      canImport: errors.length === 0,
      errors,
      warnings,
      value
    })
  }

  render() {
    const {
      replace,
      canImport,
      isOpen,
      value,
      errors,
      warnings
    } = this.state;

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
    )
  }
}
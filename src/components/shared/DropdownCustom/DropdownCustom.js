import React from 'react';
import { DropdownSelect } from 'components/core';

const CUSTOM_PROXY_VALUE = '98vy4i45vh';

export default class DropdownCustom extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { customOption, options, value } = nextProps;

    const showCustom =
      value === undefined
        ? false
        : prevState.showCustom
        ? true
        : !options.find(opt => opt.value === value);

    let customValue = nextProps.value;
    if (!showCustom) {
      customValue = prevState.customValue;
    }
    if (customValue === undefined) {
      customValue = customOption.value;
    }

    return {
      dropdownValue: showCustom ? CUSTOM_PROXY_VALUE : value,
      customValue,
      showCustom
    };
  }

  state = {};

  onDropdownChange = dropdownValue => {
    const { onChange } = this.props;
    const { customValue } = this.state;

    const showCustom = dropdownValue === CUSTOM_PROXY_VALUE;

    this.setState({ showCustom, dropdownValue });
    onChange(showCustom ? customValue : dropdownValue);
  };

  onCustomChange = customValue => {
    this.setState({ customValue });
    this.props.onChange(customValue);
  };

  render() {
    const { customOption, options, placeholder, renderCustom } = this.props;

    const { customValue, dropdownValue, showCustom } = this.state;

    return (
      <>
        <DropdownSelect
          isFloating={false}
          placeholder={placeholder}
          options={[
            ...options,
            {
              ...customOption,
              value: CUSTOM_PROXY_VALUE
            }
          ]}
          onChange={this.onDropdownChange}
          value={dropdownValue}
        />
        {showCustom &&
          renderCustom({
            onChange: this.onCustomChange,
            value: customValue
          })}
      </>
    );
  }
}

import React from 'react';

const DropdownOption = ({ option }) => (
  <option key={option.value} value={option.value}>
    {option.label}
  </option>
);

const normalizeOption = opt =>
  typeof opt === 'string' ? { value: opt, label: opt } : opt;

export const Dropdown = ({ onChange, options, placeholder, value }) => (
  <select onChange={e => onChange(e.target.value)} value={value}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(opt => (
      <DropdownOption
        key={normalizeOption(opt).value}
        option={normalizeOption(opt)}
      />
    ))}
  </select>
);

export const Checkbox = ({ id, label: _label, onChange, value = false }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
    <input
      checked={value}
      id={id}
      onChange={e => onChange(!value)}
      type="checkbox"
    />
    <label htmlFor={id}>{_label}</label>
  </div>
);

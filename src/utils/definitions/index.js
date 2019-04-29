import React from 'react';
import color from 'color';
import camelCase from 'lodash/camelCase';
import { Dropdown } from 'components/basic';
import { DropdownSelect, ColorField, RangeField } from 'components/core';

const constants = {
  positions: ['static', 'relative', 'absolute', 'sticky', 'fixed']
}

const toPx = v => (typeof v === 'number' ? `${v}px` : v);

const parseNumber = v => parseFloat(v);
const parseColor = v => color(v).hex();

const formatPixels = v => toPx(Math.round(v));

const lerpNumber = (from, to, t) => from + t * (to - from);

const renderMargin = ({ onChange, value = 0 }) => (
  <RangeField
    detail="px"
    max={1000}
    min={-1000}
    step={1}
    onChange={onChange}
    value={value}
  />
)

const renderPosition = ({ onChange, value = 0 }) => (
  <RangeField
    detail="px"
    max={1000}
    min={-1000}
    step={1}
    onChange={onChange}
    value={value}
  />
)

const renderRatio = ({ onChange, value = 1 }) => (
  <RangeField
    max={1}
    min={0}
    step={0.01}
    onChange={onChange}
    value={value}
  />
)

export const definitionMap = {
  'background-color': {
    format: v => color(v).hex(),
    lerp: (from, to, t) => {
      from = color(from);
      to = color(to);
      return from.mix(to, t).hex();
    },
    parse: parseColor,
    render: (props) => (
      <ColorField
        colorType="hex"
        providerType="passthrough"
        onChange={v => props.onChange(v.color)}
        value={{
          color: props.value,
          palette: [
            '#123456',
            '#842134',
            '#abc123',
            '#984fff',
            '#123456',
            '#ffffff',
            '#000000',
            '#909090',
            '#101010',
            '#203123'
          ]
        }}
      />
    )
  },
  'bottom': {
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  'height': {
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  'left': {
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  'margin-bottom': {
    computedGroup: 'margin',
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'margin-left': {
    computedGroup: 'margin',
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'margin-right': {
    computedGroup: 'margin',
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'margin-top': {
    computedGroup: 'margin',
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'opacity': {
    format: v => v,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderRatio
  },
  'position': {
    format: v => v,
    lerp: (from, to, t) => from, // todo: no animate
    parse: str => {
      return constants.positions.indexOf(str) !== -1 ? str : undefined
    },
    render: ({ onChange, value }) => (
      <DropdownSelect
        isFloating={false}
        placeholder="Position"
        options={constants.positions.map(p => ({
          label: p,
          value: p
        }))}
        onChange={onChange}
        value={value}
      />
    )
  },
  'right': {
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  'top': {
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  'width': {
    format: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
}

// Auto-apply CSS and Inline CSS names
Object.keys(definitionMap).forEach(name => {
  definitionMap[name]['id'] = name;
  definitionMap[name]['styleName'] = camelCase(name);
})

const definitionArray = Object.keys(definitionMap)
  .map(id => definitionMap[id])
  .sort((a, b) => a.name < b.name ? -1 : 1);

export const getDefinition = definitionId => definitionMap[definitionId];
export const getDefinitions = filterFn => {
  return filterFn ? definitionArray.filter(filterFn) : definitionArray;
}
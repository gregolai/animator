import React from 'react';
import color from 'color';
import camelCase from 'lodash/camelCase';
import { getEasingArray, getEasingOptions } from 'utils/easing';
import { DropdownSelect, ColorField, RangeField } from 'components/core';
import { DropdownCustom } from 'components/shared';

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


const BezierComponent = ({ value, onChange }) => (
  <RangeField
    min={0}
    max={1}
    step={0.01}
    onChange={onChange}
    value={value}
  />
)

export const definitionMap = {
  // 'animation-delay': {
  // },
  // 'animation-direction': {
  // },
  // 'animation-duration': {
  // },
  // 'animation-iteration-count': {
  // },
  'animation-timing-function': {
    format: v => {
      return typeof v === 'string' ?
        v :
        `cubic-bezier(${v[0]}, ${v[1]}, ${v[2]}, ${v[3]})`;
    },
    parse: str => {
      return getEasingArray(str);
    },
    render: ({ onChange, value }) => (
      <DropdownCustom
        customOption={{
          label: 'Custom Cubic Bezier',
          value
        }}
        renderCustom={({ onChange, value }) => {
          const [x0, y0, x1, y1] = getEasingArray(value);

          return (
            <>
              <BezierComponent
                onChange={x0 => onChange([x0, y0, x1, y1])}
                value={x0}
              />
              <BezierComponent
                onChange={y0 => onChange([x0, y0, x1, y1])}
                value={y0}
              />
              <BezierComponent
                onChange={x1 => onChange([x0, y0, x1, y1])}
                value={x1}
              />
              <BezierComponent
                onChange={y1 => onChange([x0, y0, x1, y1])}
                value={y1}
              />
            </>
          )
        }}
        placeholder="Easing"
        onChange={onChange}
        options={getEasingOptions()}
        value={value}
      />
    )
  },
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

export const getAnimatedDefinitions = () => {
  return definitionArray.filter(definition => definition.lerp !== undefined);
}

export const getInstanceDefinitions = () => {
  return definitionArray.filter(definition => definition.lerp === undefined);
}

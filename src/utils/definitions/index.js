import React from 'react';
import color from 'color';
import palettes from 'nice-color-palettes';
import camelCase from 'lodash/camelCase';
import { getEasingArray, getEasingOptions } from 'utils/easing';
import { DropdownSelect, ColorField, RangeField, UrlParseField } from 'components/core';
import { ColorSquare, DropdownCustom } from 'components/shared';

const constants = {
  animationDirections: ['normal', 'reverse', 'alternate', 'alternate-reverse'],
  backgroundRepeat: ['repeat', 'repeat-x', 'repeat-y', 'space', 'round', 'no-repeat'],
  palette: [...palettes[0], ...palettes[1], ...palettes[2]],
  positions: ['static', 'relative', 'absolute', 'sticky', 'fixed']
};

const toPx = v => (typeof v === 'number' ? `${v}px` : v);

const parseEnum = (str, list) => {
  return list.indexOf(str) !== -1 ? str : undefined;
};
const parseNumber = str => parseFloat(str);
const parseColor = str => color(str).hex();
const parseMilliseconds = str => {
  const num = parseFloat(str);
  return Math.floor(str.endsWith('s') ? num * 1000 : num);
};

const formatMilliseconds = v => `${v}ms`;
const formatPixels = v => toPx(Math.round(v));

const lerpNumber = (from, to, t) => from + t * (to - from);

const renderMargin = ({ onChange, value = 0 }) => (
  <RangeField detail="px" max={1000} min={-1000} step={1} onChange={onChange} value={value} />
);

const renderPosition = ({ onChange, value = 0 }) => (
  <RangeField detail="px" max={1000} min={-1000} step={1} onChange={onChange} value={value} />
);

const renderRatio = ({ onChange, value = 1 }) => (
  <RangeField max={1} min={0} step={0.01} onChange={onChange} value={value} />
);

const BezierComponent = ({ value, onChange }) => (
  <RangeField min={0} max={1} step={0.01} onChange={onChange} value={value} />
);

export const definitionMap = {
  'animation-delay': {
    defaultValue: 0,
    friendlyLabel: 'Delay',
    format: formatMilliseconds,
    preview: formatMilliseconds,
    parse: parseMilliseconds,
    render: ({ onChange, value = 0 }) => (
      <RangeField detail="ms" max={10000} min={0} step={50} onChange={onChange} value={value} />
    )
  },
  // 'animation-direction': {
  //   defaultValue: 'normal',
  //   friendlyLabel: 'Direction',
  //   format: v => v,
  //   preview: v => v,
  //   parse: str => parseEnum(str, constants.animationDirections),
  //   render: ({ onChange, value }) => (
  //     <DropdownSelect
  //       isFloating={false}
  //       placeholder="Animation Direction"
  //       options={constants.animationDirections.map(p => ({
  //         label: p,
  //         value: p
  //       }))}
  //       onChange={onChange}
  //       value={value}
  //     />
  //   )
  // },
  'animation-duration': {
    defaultValue: 1000,
    friendlyLabel: 'Duration',
    format: formatMilliseconds,
    preview: formatMilliseconds,
    parse: parseMilliseconds,
    render: ({ onChange, value }) => (
      <RangeField detail="ms" max={10000} min={100} step={50} onChange={onChange} value={value} />
    )
  },
  'animation-timing-function': {
    defaultValue: 'linear',
    friendlyLabel: 'Easing',
    format: v => (typeof v === 'string' ? v : `cubic-bezier(${v[0]}, ${v[1]}, ${v[2]}, ${v[3]})`),
    preview: v => (typeof v === 'string' ? v : `(${v[0]}, ${v[1]}) (${v[2]}, ${v[3]})`),
    parse: str => getEasingArray(str),
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
              <BezierComponent onChange={x0 => onChange([x0, y0, x1, y1])} value={x0} />
              <BezierComponent onChange={y0 => onChange([x0, y0, x1, y1])} value={y0} />
              <BezierComponent onChange={x1 => onChange([x0, y0, x1, y1])} value={x1} />
              <BezierComponent onChange={y1 => onChange([x0, y0, x1, y1])} value={y1} />
            </>
          );
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
    preview: v => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>{color(v).hex()}</div>
        <ColorSquare color={v} />
      </div>
    ),
    lerp: (from, to, t) => {
      from = color(from);
      to = color(to);
      return from.mix(to, t).hex();
    },
    parse: parseColor,
    render: props => (
      <ColorField
        colorType="hex"
        providerType="passthrough"
        onChange={v => props.onChange(v.color)}
        value={{
          color: props.value,
          palette: constants.palette
        }}
      />
    )
  },
  'background-image': {
    format: v => `url("${v}")`,
    preview: v => 'custom',
    parse: v => v,
    render: ({ onChange, value }) => (
      <UrlParseField
        onChange={v => onChange(v.url)}
        value={value}
      />
    )
  },
  'background-repeat': {
    format: v => v,
    preview: v => v,
    parse: v => v,
    render: ({ onChange, value }) => (
      <DropdownCustom
        customOption={{
          label: 'X, Y',
          value
        }}
        renderCustom={({ onChange, value }) => {
          const options = constants.backgroundRepeat
            .filter(p => p !== 'repeat-x' && p !== 'repeat-y')
            .map(p => ({
              label: p,
              value: p
            }));
          const [xValue = 'repeat', yValue = 'repeat'] = value.split(' ');
          return (
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <DropdownSelect
                  isFloating={false}
                  placeholder="x"
                  onChange={v => onChange(`${v} ${yValue}`)}
                  options={options}
                  value={xValue}
                />
              </div>
              <div style={{ flex: 1 }}>
                <DropdownSelect
                  isFloating={false}
                  placeholder="y"
                  onChange={v => onChange(`${xValue} ${v}`)}
                  options={options}
                  value={yValue}
                />
              </div>
            </div>
          );
        }}
        placeholder="Background Repeat"
        onChange={onChange}
        options={
          constants.backgroundRepeat.map(p => ({
            label: p,
            value: p
          }))
        }
        value={value}
      />
    )
  },
  bottom: {
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  height: {
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  left: {
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  'margin-bottom': {
    computedGroup: 'margin',
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'margin-left': {
    computedGroup: 'margin',
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'margin-right': {
    computedGroup: 'margin',
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'margin-top': {
    computedGroup: 'margin',
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  opacity: {
    format: v => v,
    preview: v => v,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderRatio
  },
  position: {
    format: v => v,
    preview: v => v,
    lerp: (from, to, t) => from, // todo: no animate
    parse: str => parseEnum(str, constants.positions),
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
  right: {
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  top: {
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  width: {
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  }
};

// Auto-apply CSS and Inline CSS names
Object.keys(definitionMap).forEach(name => {
  definitionMap[name]['id'] = name;
  definitionMap[name]['styleName'] = camelCase(name);
});

const definitionArray = Object.keys(definitionMap)
  .map(id => definitionMap[id])
  .sort((a, b) => (a.name < b.name ? -1 : 1));

export const getDefinition = definitionId => definitionMap[definitionId];
export const getDefinitions = (filterFn) => {
  return filterFn ?
    definitionArray.filter(filterFn) :
    definitionArray;
}

export const getAnimatedDefinitions = () => {
  return definitionArray.filter(definition => definition.lerp !== undefined);
};

export const getInstanceDefinitions = () => {
  return definitionArray.filter(definition => definition.lerp === undefined);
};

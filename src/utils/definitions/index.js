import { React, isNumber } from 'common';
import { normalizeRatio } from 'utils';
import colorNames from 'css-color-names';
import { color } from '@sqs/utils';
import palettes from 'nice-color-palettes';
import camelCase from 'lodash/camelCase';
import { getEasingArray, getEasingOptions } from 'utils/easing';
import {
  DropdownSelect,
  ColorField,
  NumberField,
  RangeField,
  UrlParseField
} from 'components/core';
import { ColorSquare, DropdownCustom } from 'components/shared';
import {
  IDENTITY_MATRIX,
  decomposeMatrix,
  formatMatrix,
  lerpMatrix,
  parseMatrix,
  recomposeMatrix
} from './matrix';

const constants = {
  animationDirections: ['normal', 'reverse', 'alternate', 'alternate-reverse'],
  backgroundRepeat: [
    'repeat',
    'repeat-x',
    'repeat-y',
    'space',
    'round',
    'no-repeat'
  ],
  lineStyles: [
    'none',
    'hidden',
    'dotted',
    'dashed',
    'solid',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset'
  ],
  palette: [...palettes[0], ...palettes[1], ...palettes[2]],
  positions: ['static', 'relative', 'absolute', 'sticky', 'fixed']
};

const parseEnum = (str, list) => {
  return list.indexOf(str) !== -1 ? str : undefined;
};
const parseNumber = str => parseFloat(str);
const parseColor = str => color.parseColor(str);
const parseMilliseconds = str => {
  let num = parseFloat(str);
  if (!isNumber(str)) {
    if (str.endsWith('s') && !str.endsWith('ms')) {
      num *= 1000;
    }
  }
  return Math.floor(num);
};

const formatMilliseconds = v => `${v}ms`;
const formatPixels = v => `${Math.round(parseFloat(v))}px`;
const formatColor = v => {
  if (typeof v === 'object') {
    const r = Math.round(v.red);
    const g = Math.round(v.green);
    const b = Math.round(v.blue);
    const a = Number(v.alpha).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return v;
};

const lerpNumber = (from, to, t) => from + t * (to - from);

const lerpColor = (from, to, t) => {
  const red = lerpNumber(from.red, to.red, t);
  const green = lerpNumber(from.green, to.green, t);
  const blue = lerpNumber(from.blue, to.blue, t);
  const alpha = lerpNumber(from.alpha, to.alpha, t);
  return { red, green, blue, alpha };
};

const renderOptions = ({ options, onChange, value }) => {
  return (
    <DropdownSelect
      isFloating={false}
      options={options.map(opt => {
        return typeof opt === 'string' ? { label: opt, value: opt } : opt;
      })}
      onChange={onChange}
      value={value}
    />
  );
};

const renderMargin = ({ onChange, value = 0 }) => (
  <RangeField
    detail="px"
    max={1000}
    min={-1000}
    step={1}
    onChange={onChange}
    value={value}
  />
);

const renderPosition = ({ onChange, value = 0 }) => {
  value = Math.round(value);
  return (
    <RangeField
      detail="px"
      max={1000}
      min={-1000}
      step={1}
      onChange={onChange}
      value={value}
    />
  );
};

const renderRatio = ({ onChange, value = 1 }) => (
  <RangeField max={1} min={0} step={0.01} onChange={onChange} value={value} />
);

const renderColor = ({ onChange, value }) => {
  const color = formatColor(value);
  return (
    <div style={{ width: 320 }}>
      <ColorField
        colorType="rgba"
        providerType="passthrough"
        onChange={v => onChange(parseColor(v.color))}
        value={{
          color,
          palette: constants.palette
        }}
      />
    </div>
  );
};

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
      <RangeField
        detail="ms"
        max={10000}
        min={0}
        step={50}
        onChange={onChange}
        value={value}
      />
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
      <RangeField
        detail="ms"
        max={10000}
        min={100}
        step={50}
        onChange={onChange}
        value={value}
      />
    )
  },
  'animation-timing-function': {
    defaultValue: 'linear',
    friendlyLabel: 'Easing',
    format: v =>
      typeof v === 'string'
        ? v
        : `cubic-bezier(${v[0]}, ${v[1]}, ${v[2]}, ${v[3]})`,
    preview: v =>
      typeof v === 'string' ? v : `(${v[0]}, ${v[1]}) (${v[2]}, ${v[3]})`,
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
    defaultValue: { red: 0, green: 0, blue: 0, alpha: 1 },
    format: v => formatColor(v),
    preview: v => {
      const formatted = formatColor(v);
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{formatted.replace('rgba', '')}</div>
          <ColorSquare color={formatted} />
        </div>
      );
    },
    lerp: (from, to, t) => lerpColor(from, to, t),
    parse: parseColor,
    render: props => {
      const color = formatColor(props.value);
      return (
        <div style={{ width: 320 }}>
          <ColorField
            colorType="rgba"
            providerType="passthrough"
            showTransparentColor={true}
            onChange={v => props.onChange(parseColor(v.color))}
            value={{
              color: color,
              palette: constants.palette
            }}
          />
        </div>
      );
    }
  },
  'background-image': {
    format: v => `url("${v}")`,
    preview: v => 'custom',
    parse: v => v,
    render: ({ onChange, value }) => (
      <UrlParseField onChange={v => onChange(v.url)} value={value} />
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
        options={constants.backgroundRepeat.map(p => ({
          label: p,
          value: p
        }))}
        value={value}
      />
    )
  },

  'border-right': {
    defaultValue: {
      width: 0,
      style: 'solid',
      color: { red: 0, green: 0, blue: 0, alpha: 1 }
    },
    format: v => {
      const width = formatPixels(v.width);
      const style = v.style;
      const color = formatColor(v.color);
      return `${width} ${style} ${color}`;
    },
    preview: v => 'hello',
    lerp: (from, to, t) => {
      const width = lerpNumber(from.width, to.width, t);
      const style = t < 0.5 ? from.style : to.style;
      const color = lerpColor(from.color, to.color, t);
      return { width, style, color };
    },
    parse: str => {
      const parts = str.split(' ');
      let style = 'solid',
        width = 0,
        color = { red: 0, green: 0, blue: 0, alpha: 1 };

      parts.forEach(part => {
        if (constants.lineStyles.indexOf(part) !== -1) {
          style = part;
        } else if (
          colorNames[part] !== undefined ||
          part.startsWith('#') ||
          part.startsWith('rgb') ||
          part.startsWith('hsl')
        ) {
          color = parseColor(part);
        } else if (!isNaN(parseFloat(part))) {
          width = parseNumber(part);
        }
      });
      return { style, width, color };
    },
    render: ({ onChange, value }) => {
      const { width, style, color } = value;
      return (
        <>
          {renderPosition({
            onChange: width => onChange({ ...value, width }),
            value: width
          })}
          {renderOptions({
            options: constants.lineStyles,
            onChange: style => onChange({ ...value, style }),
            value: style
          })}
          {renderColor({
            onChange: color => onChange({ ...value, color }),
            value: color
          })}
        </>
      );

      //return <div>VALUE: {JSON.stringify(value)}</div>
    }
  },

  bottom: {
    defaultValue: 0,
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  height: {
    defaultValue: 0,
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  left: {
    defaultValue: 0,
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  'margin-bottom': {
    defaultValue: 0,
    computedGroup: 'margin',
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'margin-left': {
    defaultValue: 0,
    computedGroup: 'margin',
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'margin-right': {
    defaultValue: 0,
    computedGroup: 'margin',
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  'margin-top': {
    defaultValue: 0,
    computedGroup: 'margin',
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderMargin
  },
  opacity: {
    defaultValue: 1,
    format: v => v,
    preview: v => normalizeRatio(v),
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderRatio
  },
  position: {
    format: v => v,
    preview: v => v,
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
    defaultValue: 0,
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },

  // HACKY - REWRITE
  transform: {
    //'translate(0, 0) rotateZ(45deg) scale(1, 1)',
    defaultValue: {
      translate: { x: 0, y: 0 },
      rotate: { z: 0 },
      scale: { x: 1, y: 1 }
    },
    format: v =>
      `translate(${v.translate.x}px, ${v.translate.y}px) rotateZ(${
        v.rotate.z
      }deg) scale(${v.scale.x}, ${v.scale.y})`,
    preview: v =>
      `(${Math.round(v.translate.x)}, ${Math.round(
        v.translate.y
      )}) (${Math.round(v.rotate.z)}) (${Number(v.scale.x).toFixed(
        2
      )}, ${Number(v.scale.y).toFixed(2)})`,
    lerp: (from, to, t) => {
      return {
        translate: {
          x: lerpNumber(from.translate.x, to.translate.x, t),
          y: lerpNumber(from.translate.y, to.translate.y, t)
        },
        rotate: {
          z: lerpNumber(from.rotate.z, to.rotate.z, t)
        },
        scale: {
          x: lerpNumber(from.scale.x, to.scale.x, t),
          y: lerpNumber(from.scale.y, to.scale.y, t)
        }
      };
    },
    parse: v => {
      // hacky
      let [strTranslate = '', strRotate = '', strScale = ''] = v.split(' ');

      strTranslate = strTranslate.replace('translate(', '').replace(')', '');
      strRotate = strRotate
        .replace('rotateZ(', '')
        .replace(')', '')
        .replace('deg', '');
      strScale = strScale.replace('scale(', '').replace(')', '');

      const [translateX = '0', translateY = '0'] = strTranslate.split(',');
      const [scaleX = '1', scaleY = '1'] = strScale.split(',');

      return {
        translate: {
          x: parseFloat(translateX),
          y: parseFloat(translateY)
        },
        rotate: {
          z: parseFloat(strRotate)
        },
        scale: {
          x: parseFloat(scaleX),
          y: parseFloat(scaleY)
        }
      };
    },
    render: ({ value, onChange }) => {
      return (
        <>
          <NumberField
            label="TranslateX"
            onChange={x =>
              onChange({ ...value, translate: { ...value.translate, x } })
            }
            value={value.translate.x}
          />
          <NumberField
            label="TranslateY"
            onChange={y =>
              onChange({ ...value, translate: { ...value.translate, y } })
            }
            value={value.translate.y}
          />

          <NumberField
            label="Rot"
            onChange={rot =>
              onChange({ ...value, rotate: { ...value.rotate, z: rot } })
            }
            value={value.rotate.z}
          />

          <NumberField
            label="ScaleX"
            onChange={x => onChange({ ...value, scale: { ...value.scale, x } })}
            value={value.scale.x}
          />
          <NumberField
            label="ScaleY"
            onChange={y => onChange({ ...value, scale: { ...value.scale, y } })}
            value={value.scale.y}
          />
        </>
      );
    }
  },

  // TRANSFORM USING MATRIX
  // transform: {
  //   // IDENTITY_MATRIX, decomposeMatrix, formatMatrix, lerpMatrix, parseMatrix, recomposeMatrix
  //   defaultValue: IDENTITY_MATRIX,
  //   format: v => formatMatrix(v),
  //   preview: v => <div>a matrix</div>,
  //   lerp: (from, to, t) => lerpMatrix(from, to, t),
  //   parse: str => parseMatrix(str),
  //   render: ({ onChange, value }) => {
  //     const decomposed = decomposeMatrix(value);

  //     const createInput = (name, getValue = v => v, setValue = v => v) => (
  //       <div>
  //         <label>
  //           {name}
  //           <input
  //             type="number"
  //             onChange={e => onChange(
  //               recomposeMatrix({
  //                 ...decomposed,
  //                 [name]: parseFloat(e.target.value)
  //               })
  //             )}
  //             value={getValue(decomposed[name])}
  //           />
  //         </label>
  //       </div>
  //     )

  //     return (
  //       <div>
  //         {createInput('translateX')}
  //         {createInput('translateY')}
  //         {createInput('translateZ')}
  //       </div>
  //     )
  //   }
  // },

  top: {
    defaultValue: 0,
    format: formatPixels,
    preview: formatPixels,
    lerp: lerpNumber,
    parse: parseNumber,
    render: renderPosition
  },
  width: {
    defaultValue: 0,
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

  definitionMap[name]['cssName'] = name; // e.g. background-color

  definitionMap[name]['styleName'] = camelCase(name);
});

const definitionArray = Object.keys(definitionMap)
  .map(id => definitionMap[id])
  .sort((a, b) => (a.name < b.name ? -1 : 1));

export const getDefinition = definitionId => definitionMap[definitionId];
export const getDefinitions = filterFn => {
  return filterFn ? definitionArray.filter(filterFn) : definitionArray;
};

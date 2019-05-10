import { React, normalizeRatio } from 'common';
import { ColorSquare, DropdownCustom } from 'components/shared';
import { DropdownSelect, ColorField, NumberField, RangeField, UrlParseField } from 'components/core';

import { getEasingArray } from '../easing';

import enums from './enums';
import format from './format';
import parse from './parse';

import palettes from 'nice-color-palettes';

const colorPalette = [...palettes[0], ...palettes[1], ...palettes[2]];

const listToOptions = list => {
  return list.map(k => {
    return typeof k === 'object' ? k : { label: k, value: k };
  });
}

const BezierComponent = ({ value, onChange }) => (
  <RangeField min={0} max={1} step={0.01} onChange={onChange} value={value} />
);

export default {
  color: ({ onChange, value }) => {
    const color = value === undefined ? undefined : format.color(value);
    return (
      <div style={{ width: 320 }}>
        <ColorField
          colorType="rgba"
          providerType="passthrough"
          onChange={v => onChange(parse.color(v.color))}
          value={{
            color,
            palette: colorPalette
          }}
        />
      </div>
    )
  },

  easing: ({ onChange, value }) => {
    return (
      <DropdownCustom
        customOption={{ label: 'cubic-bezier', value }}
        onChange={onChange}
        options={listToOptions(enums.animationTimingFunction)}
        placeholder="Easing"
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
        value={value}
      />
    );
  },

  enum: ({ list, onChange, placeholder, value }) => {
    return (
      <DropdownSelect
        isFloating={false}
        placeholder={placeholder}
        onChange={onChange}
        options={listToOptions(list)}
        value={value}
      />
    );
  },

  enumCustom: ({ label = 'Custom', renderCustom, list, onChange, placeholder, value }) => {
    return (
      <DropdownCustom
        customOption={{ label, value }}
        onChange={onChange}
        options={listToOptions(list)}
        placeholder={placeholder}
        renderCustom={renderCustom}
        value={value}
      />
    )
  },

  image: ({ onChange, value }) => {
    return (
      <>
        {value && (
          <img alt="" style={{ height: 120, width: '100%', objectFit: 'contain' }} src={value} />
        )}
        <UrlParseField
          placeholder="URL"
          onChange={v => onChange(v.url)}
          value={value}
        />
      </>
    );
  },

  integerRange: ({ step = 1, min = -1000, max = 1000, onChange, value = 0 }) => {
    return (
      <RangeField
        max={max}
        min={min}
        step={step}
        onChange={v => onChange(Math.round(v))}
        value={Math.round(value)}
      />
    );
  },

  pixelRange: ({ step = 1, min = -1000, max = 1000, onChange, value = 0 }) => {
    return (
      <RangeField
        detail="px"
        max={max}
        min={min}
        step={step}
        onChange={v => onChange(Math.round(v))}
        value={Math.round(value)}
      />
    );
  },

  ratioRange: ({ step = 0.01, onChange, value = 0 }) => {
    return (
      <RangeField
        max={1}
        min={0}
        step={step}
        onChange={onChange}
        value={value}
      />
    );
  },

  timeRange: ({ step = 10, min = 0, max = 10000, onChange, value = 0 }) => {
    return (
      <RangeField
        detail="ms"
        max={max}
        min={min}
        step={step}
        onChange={v => onChange(Math.round(v))}
        value={Math.round(value)}
      />
    );
  }
}
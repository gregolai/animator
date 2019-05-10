import { React, normalizeRatio } from 'common';
import { ColorSquare, DropdownCustom } from 'components/shared';
import { DropdownSelect, ColorField, NumberField, RangeField, UrlParseField } from 'components/core';

import format from './format';
import parse from './parse';

import palettes from 'nice-color-palettes';

const colorPalette = [...palettes[0], ...palettes[1], ...palettes[2]];

const listToOptions = list => {
  return list.map(k => {
    return typeof k === 'object' ? k : { label: k, value: k };
  });
}

export default {
  color: ({ onChange, value }) => {
    const color = format.color(value);
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

  ratioRange: ({ step = 0.01, onChange, value }) => {
    return (
      <RangeField
        max={1}
        min={0}
        step={step}
        onChange={onChange}
        value={value} />
    );
  },

  integerRange: ({ step = 1, min = -1000, max = 1000, onChange, value }) => {
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

  pixelRange: ({ step = 1, min = -1000, max = 1000, onChange, value }) => {
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

  timeRange: ({ step = 10, min = 0, max = 10000, onChange, value }) => {
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
  },

  url: ({ onChange, value }) => {
    return (
      <UrlParseField
        placeholder="URL"
        onChange={v => onChange(v.url)}
        value={value}
      />
    );
  }
}
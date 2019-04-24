import React from 'react';
import color from 'color';
import { ColorField, NumberField, RangeField } from 'components/core';

export const toPx = v => (typeof v === 'number' ? `${v}px` : v);


export const parsers = {
  color: v => color(v).hex(),
  number: v => parseFloat(v)
}

export const renderers = {
  color: (statics) => ({ onChange, value }) => (
    <ColorField
      colorType="hex"
      providerType="passthrough"
      {...statics}
      onChange={v => onChange(v.color)}
      value={{
        color: value,
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
  ),
  number: (statics) => ({ onChange, value }) => (
    <NumberField
      step={1}
      {...statics}
      onChange={onChange}
      value={value}
    />
  ),
  pixel: (statics) => ({ onChange, value }) => (
    <RangeField
      detail="px"
      max={2000}
      min={0}
      step={1}
      {...statics}
      onChange={onChange}
      value={value}
    />
  )
}

export const lerps = {
  color: (from, to, t) => {
    from = color(from);
    to = color(to);
    return from.mix(to, t).hex();
  },
  number: (from, to, t) => {
    return from + t * (to - from);
  }
}

export const createProp = (name, cssName) => ({ name, cssName });

export const createPixelProps = ({ name, cssName, render }) => ({
  ...createProp(name, cssName),
  lerp: lerps.number,
  parse: parsers.number,
  format: v => v === undefined ? '•' : toPx(Math.round(v)),
  render: renderers.pixel(render)
});

export const createColorProps = ({ name, cssName, render }) => ({
  ...createProp(name, cssName),
  lerp: lerps.color,
  parse: parsers.color,
  format: v => v === undefined ? '•' : color(v).hex(),
  render: renderers.color(render)
});
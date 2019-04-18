import React from 'react';
import color from 'color';
import ColorField from '@sqs/core-components/fields/ColorField';
import NumberField from '@sqs/core-components/fields/NumberField';

export const toPx = v => (typeof v === 'number' ? `${v}px` : v);

export const parsers = {
  color: v => color(v).rgb().string(),
  number: v => parseFloat(v)
}

export const renderers = {
  color: ({ onChange, value }) => (
    <ColorField
      onChange={onChange}
      value={value}
    />
  ),
  number: ({ onChange, value }) => (
    <NumberField
      onChange={onChange}
      value={value}
    />
  )
}

export const lerps = {
  color: (from, to, t) => {
    from = color(from);
    to = color(to);
    return from.mix(to, t).rgb().string();
  },
  number: (from, to, t) => {
    return from + t * (to - from);
  }
}

export const createProp = (name, cssName) => ({ name, cssName });

export const createPixelProps = (name, cssName) => ({
  ...createProp(name, cssName),
  lerp: lerps.number,
  parse: parsers.number,
  format: v => toPx(v),
  render: renderers.number
});

export const createColorProps = (name, cssName) => ({
  ...createProp(name, cssName),
  lerp: lerps.color,
  parse: parsers.color,
  format: v => toPx(v),
  render: renderers.color
});
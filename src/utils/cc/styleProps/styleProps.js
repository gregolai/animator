import kebabCase from 'lodash/kebabCase';
import isFunction from 'lodash/isFunction';

import enums from './enums';
import is from './is';
import format from './format';
import parse from './parse';
import lerp from './lerp';
import preview from './preview';
import render from './render';

import React from 'react';

const tokenize = str => {
  str = str.trim();

  // normalize using single spaces
  str = str.replace(/\s+/g, ' ');

  // remove spaces after commas
  // e.g. rgb(10, 20, 30) => rgb(10,20,30)
  str = str.replace(/,\s+/g, ',');

  // split by single spaces
  return str.split(' ');
}

const stylePropMap = {
  animationDelay: {
    format: v => format.milliseconds(v),
    parse: str => parse.milliseconds(str),

    preview: v => preview.milliseconds(v),
    render: ({ onChange, value }) => render.timeRange({ onChange, value })
  },
  animationDuration: {
    format: v => format.milliseconds(v),
    parse: str => parse.milliseconds(str),

    preview: v => preview.milliseconds(v),
    render: ({ onChange, value }) => render.timeRange({ onChange, value })
  },
  animationTimingFunction: {
    format: v => format.easing(v),
    parse: str => parse.easing(str),

    preview: v => preview.easing(v),
    render: ({ onChange, value }) => render.easing({ onChange, value })
  },
  backgroundColor: {
    format: v => format.color(v),
    parse: str => parse.color(str),
    lerp: (from, to, t) => lerp.color(from, to, t),

    preview: v => preview.color(v),
    render: ({ onChange, value }) => render.color({ onChange, value })
  },
  backgroundImage: {
    format: v => format.imageUrl(v),
    parse: str => str,
    lerp: (from, to, t) => lerp.static(from, to, t),

    preview: v => preview.image(v),
    render: ({ onChange, value }) => render.image({ onChange, value })
  },
  backgroundRepeat: {
    format: v => v,
    parse: str => parse.enum(tokenize(str)[0]),

    preview: () => 'TODO',
    render: ({ onChange, value }) => render.enum({
      list: enums.backgroundRepeat,
      placeholder: 'Background Repeat',
      onChange,
      value
    })
  },
  borderRight: {
    format: v => {
      const width = format.pixels(v.width);
      const style = v.style;
      const color = format.color(v.color);
      return `${width} ${style} ${color}`;
    },
    parse: str => {
      return tokenize(str).reduce((v, token) => {

        if (is.enumValue(token, enums.lineStyles)) {
          v.style = parse.enum(token, enums.lineStyles);
        } else if (is.colorString(token)) {
          v.color = parse.color(token);
        } else if (is.floatString(token)) {
          v.width = parse.integer(token);
        }

        return v;
      }, {
          color: { red: 0, green: 0, blue: 0, alpha: 1 },
          style: 'solid',
          width: 0
        })
    },
    lerp: (from, to, t) => {
      const width = lerp.integer(from.width, to.width, t);
      const style = t < 0.5 ? from.style : to.style;
      const color = lerp.color(from.color, to.color, t);
      return { width, style, color };
    },

    preview: () => 'TODO',
    render: () => 'TODO'
  },
  bottom: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  },
  height: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  },
  left: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  },
  marginBottom: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  },
  marginLeft: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  },
  marginRight: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  },
  marginTop: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  },
  opacity: {
    format: v => format.ratio(v),
    parse: str => parse.ratio(str),
    lerp: (from, to, t) => lerp.float(from, to, t),

    preview: v => preview.float(v),
    render: ({ onChange, value }) => render.ratioRange({ onChange, value })
  },
  position: {
    format: v => v,
    parse: str => parse.enum(str, enums.positions),
    lerp: (from, to, t) => lerp.static(from, to, t),

    preview: () => 'TODO',
    render: ({ onChange, value }) => render.enum({
      list: enums.positions,
      placeholder: 'CSS Position',
      onChange,
      value
    })
  },
  right: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  },
  top: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  },

  // TODO: STORE AS MATRIX4x4
  // transform: {
  //   format: v => formatTransform(v)
  // },

  width: {
    format: v => format.pixels(v),
    parse: str => parse.integer(str),
    lerp: (from, to, t) => lerp.integer(from, to, t),

    preview: v => preview.pixels(v),
    render: ({ onChange, value }) => render.pixelRange({ onChange, value })
  }
};

const stylePropArray = [];

Object.keys(stylePropMap).forEach(styleName => {
  const entry = stylePropMap[styleName];
  entry.id = styleName; // e.g. backgroundColor
  entry.styleName = styleName; // e.g. backgroundColor
  entry.cssName = kebabCase(styleName); // e.g. background-color
  stylePropArray.push(entry);
});

export const getStyleProp = propId => {
  return stylePropMap[propId];
};

export const getCssProp = cssPropName => {
  return stylePropArray.find(prop => prop.cssName === cssPropName);
}

export const getStyleProps = filterFn => {
  return filterFn ?
    stylePropArray.filter(filterFn) :
    stylePropArray;
}

export const canInterpolate = propId => {
  const entry = getStyleProp(propId);
  return entry && isFunction(entry.lerp);
};

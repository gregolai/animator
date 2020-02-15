import kebabCase from 'lodash/kebabCase';
import isFunction from 'lodash/isFunction';

import enums from './enums';
import is from './is';
import format from './format';
import parse from './parse';
import lerp from './lerp';
import preview from './preview';
import render from './render';

/**
 * 
 * @param {string} str 
 */
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

/**
 * Extracts values from strings like:
 *   rgba(10,20,30,1) => { key: 'rgba', values: ['10', '20', '30', '1'] }
 *   translateX(20) => { key: 'translateX', values: ['20'] }
 * @param {string} str 
 */
const extractParens = str => {
  str = str.trim();

  const [key, ...values] = str.match(/(\w+)/g);
  return { key, values }
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

    preview: v => preview.opacity(v),
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

  transform: {
    format: v => `translate(0, 0)`,
    parse: str => null,
    lerp: (from, to, t) => from,
    preview: v => 'TODO',
    render: ({ onChange, value }) => null
  },

  // transform: {
  //   format: v => {
  //     const [tx, ty, tz] = v.translate;
  //     const [rx, ry, rz] = v.rotate;
  //     const [sx, sy, sz] = v.scale;
      
  //     const translate = `translate3d(${tx}, ${ty}, ${tz})`
  //     const rotate = `rotateX(${format.deg(rx)}) rotateY(${format.deg(ry)}) rotateZ(${format.deg(rz)})`;
  //     const scale = `scale3d(${sx}, ${sy}, ${sz})`;
      
  //     // ORDER: translate, rotate, scale
  //     return `${translate} ${rotate} ${scale}`;
  //   },
  //   parse: str => {

  //     tokenize(str).reduce((v, token) => {

  //       if (token.startsWith('matrix')) {

  //         const { key, values } = extractParens(token);

  //         if (key === 'matrix') {
  //           const [a, b, c, d, tx, ty] = values;
  //           // TODO

  //         } else if (key === 'matrix3d') {
  //           // prettier-ignore
  //           const [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4] = values;
  //           // TODO
  //         }

  //       } else if (token.startsWith('perspective')) {

  //         const { values } = extractParens(token);
  //         if (is.floatString(values[0])) {
  //           // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/perspective
  //           const d = parse.float(values[0]);
  //           const m = [
  //             1, 0, 0, 0,
  //             0, 1, 0, 0,
  //             0, 0, 1, 0,
  //             0, 0, 1 / d, 1
  //           ]
  //           // TODO
  //         }

  //       } else if (token.startsWith('rotate')) {

  //       } else if (token.startsWith('scale')) {

  //         // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale3d
  //         const { values } = extractParens(token);
  //         const [x, y, z] = values;

  //         if (is.floatString(x)) {
  //           // TODO
  //         }
  //         if (is.floatString(y)) {
  //           // TODO
  //         }
  //         if (is.floatString(z)) {
  //           // TODO
  //         }

  //       } else if (token.startsWith('skew')) {

  //         // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skew
  //         const { values } = extractParens(token);
  //         const [x, y] = values;
  //         if (is.floatString(x)) {
  //           // TODO
  //         }
  //         if (is.floatString(y)) {
  //           // TODO
  //         }

  //       } else if (token.startsWith('translate')) {

  //         // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translate3d
  //         const { values } = extractParens(token);
  //         const [x, y, z] = values;
  //         if (is.floatString(x)) {
  //           // TODO
  //         }
  //         if (is.floatString(y)) {
  //           // TODO
  //         }
  //         if (is.floatString(z)) {
  //           // TODO
  //         }

  //       }

  //       return v;
  //     }, {
  //         translate: [0, 0, 0],
  //         rotate: [0, 0, 0],
  //         rotateOrder: 'XYZ',
  //         scale: [0, 0, 0]
  //       });
  //   },
  //   lerp: (from, to, t) => {
  //     return {
  //       translate: [
  //         lerp.float(from.translate[0], to.translate[0], t),
  //         lerp.float(from.translate[1], to.translate[1], t),
  //         lerp.float(from.translate[2], to.translate[2], t),
  //       ],
  //       rotate: [
  //         lerp.float(from.rotate[0], to.rotate[0], t),
  //         lerp.float(from.rotate[1], to.rotate[1], t),
  //         lerp.float(from.rotate[2], to.rotate[2], t),
  //       ],
  //       scale: [
  //         lerp.float(from.scale[0], to.scale[0], t),
  //         lerp.float(from.scale[1], to.scale[1], t),
  //         lerp.float(from.scale[2], to.scale[2], t),
  //       ]
  //     }
  //   },

  //   preview: v => 'TODO',
  //   render: ({ onChange, value = { translate: { x: 0, y: 0, z: 0 } } }) => {

  //     return [
  //       render.integerRange({
  //         onChange: x => onChange({ ...value, translate: { ...value.translate, x } }),
  //         value: value.translate.x
  //       }),
  //       render.integerRange({
  //         onChange: y => onChange({ ...value, translate: { ...value.translate, y } }),
  //         value: value.translate.y
  //       }),
  //       render.integerRange({
  //         onChange: z => onChange({ ...value, translate: { ...value.translate, z } }),
  //         value: value.translate.z
  //       })
  //     ]
  //   }
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

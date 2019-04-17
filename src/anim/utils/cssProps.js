import color from 'color';

const toPx = v => (typeof v === 'number' ? `${v}px` : v);

const parsers = {
  color: v => color(v).rgb().string(),
  number: v => v => parseFloat(v)
}

const inputTypes = {
  color: 'color',
  number: 'number'
}

const lerps = {
  color: (from, to, t) => {
    from = color(from);
    to = color(to);
    return from.mix(to, t).rgb().string();
  },
  number: (from, to, t) => {
    return from + t * (to - from);
  }
}

const createMarginProp = (name) => ({
  defaultValue: 0,
  name: 'top',
  lerp: lerps.number,
  type: inputTypes.number
})

const asMap = {
  margin: {
    name: 'margin',
    cssName: 'margin',
    format: ([top, right, bottom, left]) => {
      return `${toPx(top)} ${toPx(right)} ${toPx(bottom)} ${toPx(left)}`;
    },
    parse: v => {
      if (typeof v === 'string') {
        v = v.split(' ');
      } else {
        v = [v, v, v, v];
      }

      // Make every element a number (assume px for now)
      v = v.map(x => parseFloat(x));

      switch (v.length) {
        case 1:
          return [v[0], v[0], v[0], v[0]]; // Apply to all four sides
        case 2:
          return [v[0], v[1], v[0], v[1]]; // vertical | horizontal
        case 3:
          return [v[0], v[1], v[2], v[1]]; // top | horizontal | bottom
        default:
          return [v[0], v[1], v[2], v[3]];
      }
    },
    groups: [
      createMarginProp('top'),
      createMarginProp('right'),
      createMarginProp('bottom'),
      createMarginProp('left')
    ]
  },
  backgroundColor: {
    name: 'backgroundColor',
    cssName: 'background-color',
    lerp: lerps.color,
    parse: parsers.color,
    format: v => v,
    type: inputTypes.color
  },
  left: {
    name: 'left',
    cssName: 'left',
    lerp: lerps.number,
    parse: parsers.number,
    format: v => `${v}px`,
    type: inputTypes.number
  },
  top: {
    name: 'top',
    cssName: 'top',
    lerp: lerps.number,
    parse: parsers.number,
    format: v => `${v}px`,
    type: inputTypes.number
  }
};

const asArray = Object.keys(asMap)
  .map(name => asMap[name])
  .sort((a, b) => a.name < b.name ? -1 : 1);

const reverseLookup = Object.keys(asMap).reduce((map, name) => {
  const entry = asMap[name];
  map[entry.cssName] = entry;
  return map;
}, {});

export const getPropDefinitionFromName = name => asMap[name];
export const getPropDefinitionFromCSSName = name => reverseLookup[name];
export const getPropDefinitionList = () => asArray;

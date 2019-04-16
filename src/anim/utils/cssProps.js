import color from 'color';

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

const asMap = (map => {
  // APPLY NAMES
  Object.keys(map).forEach(name => map[name].name = name);
  return map;
})({
  backgroundColor: {
    cssName: 'background-color',
    lerp: lerps.color,
    parse: parsers.color,
    format: v => v,
    type: inputTypes.color
  },
  left: {
    cssName: 'left',
    lerp: lerps.number,
    parse: parsers.number,
    format: v => `${v}px`,
    type: inputTypes.number
  },
  top: {
    cssName: 'top',
    lerp: lerps.number,
    parse: parsers.number,
    format: v => `${v}px`,
    type: inputTypes.number
  }
})

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

import React from 'react';
import background from './background';
import margin from './margin';
import position from './position';

const asMap = {
  ...background,
  ...margin,
  ...position
};

// sorted array
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

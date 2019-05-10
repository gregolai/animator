import React from 'react';
import cx from 'classnames';
import randomColor from 'randomcolor';
import noop from 'lodash/noop';
import chunk from 'lodash/chunk';
import clamp from 'lodash/clamp';
import isNumber from 'lodash/isNumber';

export { default as createUniqueName } from './utils/createUniqueName';
export { startDrag } from './utils/mouse';

export const INTERVAL_MS = 10;

export const getRandomColor = () => randomColor();

// for grid snap
export const roundToInterval = (value, interval) => {
  return Math.round(value / interval) * interval;
};

export const normalizeRatio = (time, precision = 2) => {
  time = Number(time).toFixed(2);
  return clamp(parseFloat(time), 0, 1);
};

export { React, cx, noop, clamp, chunk, isNumber };

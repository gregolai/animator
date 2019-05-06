import React from 'react';
import cx from 'classnames';
import { uniqueNamesGenerator } from 'unique-names-generator';
import randomColor from 'randomcolor';
import noop from 'lodash/noop';
import chunk from 'lodash/chunk';
import clamp from 'lodash/clamp';
import isNumber from 'lodash/isNumber';

export { startDrag } from './utils/mouse';

export const INTERVAL_MS = 10;

export const createUniqueName = () => uniqueNamesGenerator('-', true);
export const getRandomColor = () => randomColor();

// for grid snap
export const roundToInterval = (value, interval) => {
  return Math.round(value / interval) * interval;
};

export const normalizeRatio = time => {
  time = Number(time).toFixed(2);
  time = clamp(time, 0, 1);
  return time;
};

export { React, cx, noop, clamp, chunk, isNumber };

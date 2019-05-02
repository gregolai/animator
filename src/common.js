import React from 'react';
import cx from 'classnames';
import noop from 'lodash/noop';
import chunk from 'lodash/chunk';
import clamp from 'lodash/clamp';

export { startDrag } from './utils/mouse';

export const INTERVAL_MS = 10;

// for grid snap
export const roundToInterval = (value, interval) => {
  return Math.round(value / interval) * interval;
};

export const normalizeRatio = time => {
  time = Number(time).toFixed(2);
  time = clamp(time, 0, 1);
  return time;
};

export { React, cx, noop, clamp, chunk };

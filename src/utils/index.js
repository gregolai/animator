import React from 'react';
import cx from 'classnames';
import noop from 'lodash/noop';

// for grid snap
export const roundToInterval = (value, interval) => {
  return Math.round(value / interval) * interval;
}

export {
  React,
  cx,
  noop
}
import React from 'react';
import cx from 'classnames';

// for grid snap
export const roundToInterval = (value, interval) => {
  return Math.round(value / interval) * interval;
}

export {
  React,
  cx
}
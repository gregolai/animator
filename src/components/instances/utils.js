import { INTERVAL_MS } from 'common';

export const timeToPixels = (milliseconds, spacing) => {
  return Math.floor((milliseconds * spacing) / INTERVAL_MS);
};

export const pixelsToTime = (pixels, spacing) => {
  return Math.floor((pixels * INTERVAL_MS) / spacing);
};

import { INTERVAL_MS } from 'utils/constants';

export const timeToPixels = (milliseconds, spacing) => {
  return Math.floor(milliseconds * spacing / INTERVAL_MS);
}

export const pixelsToTime = (pixels, spacing) => {
  return Math.floor(pixels * INTERVAL_MS / spacing);
}

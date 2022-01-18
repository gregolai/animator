export const INTERVAL_MS = 10;

export const timeToPixels = (milliseconds: number, spacing: number) => {
	return Math.floor((milliseconds * spacing) / INTERVAL_MS);
};

export const pixelsToTime = (pixels: number, spacing: number) => {
	return Math.floor((pixels * INTERVAL_MS) / spacing);
};

export const color = {
	parseColor: str =>
		str
			? {
					red: 255,
					green: 255,
					blue: 0,
					alpha: 1,
					color: '#ffff00'
			  }
			: null,
	stringifyColor: (rgb, format) => '#ffff00',
	isDark: obj => false
};

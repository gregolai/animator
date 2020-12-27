import React from 'react';
import clamp from 'lodash/clamp';

export default ({
	className,
	// flush = true

	label,
	min,
	max,
	onChange,
	step,
	value
}) => {
	const c = (v) => (v === undefined ? undefined : clamp(v, min, max));

	return (
		<label className={className}>
			{label}
			<input
				type="range"
				min={min}
				max={max}
				onChange={(e) => onChange(c(parseFloat(e.target.value)))}
				step={step}
				style={{ flex: 1 }}
				value={c(value)}
			/>
		</label>
	);
};

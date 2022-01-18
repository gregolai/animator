import React from 'react';

export default ({
	// fieldIndex = 0,
	className,
	label,
	onChange,
	value
}) => {
	return (
		<div className={className}>
			{label}
			<textarea
				className={className}
				onChange={(e) => onChange(e.target.value)}
				style={{ display: 'block', height: '500px', width: '100%', padding: 0 }}
				value={value}
			/>
		</div>
	);
};

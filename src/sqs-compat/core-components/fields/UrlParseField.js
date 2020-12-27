import React from 'react';

export default ({ placeholder, onChange, value }) => {
	return (
		<label>
			<input
				placeholder={placeholder}
				type="text"
				style={{ flex: 1 }}
				onChange={(e) => onChange(e.target.value)}
				value={value}
			/>
		</label>
	);
};

import React from 'react';

export default ({ className, color, isDisabled, label, onClick }) => {
	color = color === 'primary' ? 'blue' : color === 'warning' ? 'red' : 'black';
	return (
		<div
			className={className}
			onClick={onClick}
			style={{
				cursor: 'pointer',
				color,
				opacity: isDisabled ? 0.4 : 1
			}}
		>
			{label}
		</div>
	);
};

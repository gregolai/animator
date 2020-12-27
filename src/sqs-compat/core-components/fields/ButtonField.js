import React from 'react';

export default ({ color = 'primary' /* or "warning" */, isDisabled = false, label, onClick }) => {
	color = color === 'primary' ? 'blue' : color === 'warning' ? 'red' : 'black';
	return (
		<div
			onClick={onClick}
			style={{
				cursor: 'pointer',
				display: 'flex',
				justifyContent: 'center',
				opacity: isDisabled ? 0.4 : 1,
				backgroundColor: 'black',
				color: 'white'
			}}
		>
			{label}
		</div>
	);
};

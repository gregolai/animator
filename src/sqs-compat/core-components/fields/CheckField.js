import React from 'react';

export default ({
	// flush,
	className,
	icon,
	onClick,
	label,
	value
}) => {
	return (
		<div
			className={className}
			onClick={onClick}
			style={{
				cursor: 'pointer',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: 44
			}}
		>
			<div>{typeof icon === 'string' ? icon[0].toUpperCase() : icon}</div>
			<div style={{ flex: 1 }}>{label}</div>
			<div>{value ? 'ON' : 'OFF'}</div>
		</div>
	);
};

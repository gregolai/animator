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
		<div className={className} onClick={onClick}>
			<div>{typeof icon === 'string' ? icon[0].toUpperCase() : icon}</div>
			<div style={{ flex: 1 }}>{label}</div>
			<div>{value ? 'ON' : 'OFF'}</div>
		</div>
	);
};

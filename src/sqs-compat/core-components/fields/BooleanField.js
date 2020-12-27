import React from 'react';
import { Box } from 'pu2';

export default ({ label, onChange, value = false }) => {
	return (
		<Box as="label" cursor="pointer" display="flex" alignItems="center" onClick={() => onChange(!value)}>
			<Box flex="1">{label}</Box>
			<Box pl="11px">{value ? 'ON' : 'OFF'}</Box>
		</Box>
	);
};

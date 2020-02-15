import React from 'react';

export default ({ name }) => (
	<div style={{ display: 'inline-block' }}>
		{typeof name === 'string' ? name[0].toUpperCase() : name}
	</div>
);

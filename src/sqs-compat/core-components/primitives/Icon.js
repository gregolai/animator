import React from 'react';
import CarbonIcon from 'carbon-components-react/es/components/Icon';
import * as icons from 'utils/icons';

export default ({ name }) => (
	<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
		<CarbonIcon icon={icons['icon' + name] || icons.iconAdd} />
	</div>
);

import React from 'react';
import CarbonIcon from 'carbon-components-react/es/components/Icon';
import * as icons from 'utils/icons';

export default ({ description, name }) => (
	<CarbonIcon description={description || ''} icon={icons['icon' + name] || icons.iconAdd} />
);

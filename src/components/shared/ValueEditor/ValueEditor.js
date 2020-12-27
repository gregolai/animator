import React from 'react';
import { getStyleProp } from 'utils/cc/styleProps';

const ValueEditor = ({ className, definitionId, value, onChange }) => {
	const definition = getStyleProp(definitionId);

	return <div className={className}>{definition.render({ value, onChange })}</div>;
};

export default ValueEditor;

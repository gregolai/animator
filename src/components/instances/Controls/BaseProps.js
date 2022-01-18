import React from 'react';
import { Box } from 'pu2';
import chunk from 'lodash/chunk';

import { AnimationStore } from 'stores';
import { IconButton, ValueButton, ValueEditor } from 'components/shared';

import styles from './BaseProps.module.css';

const EditButton = ({ definition, isToggled, onClick, instance }) => {
	const { setInstanceDefinitionValue, getInstanceDefinitionValue } = AnimationStore.use();

	const value = getInstanceDefinitionValue(instance.id, definition.id);
	const canClear = value !== undefined;

	return (
		<ValueButton
			accessory={
				canClear && (
					<IconButton
						icon="Delete"
						onClick={() => setInstanceDefinitionValue(instance.id, definition.id, undefined)}
					/>
				)
			}
			className={styles.button}
			definition={definition}
			isToggled={isToggled}
			onClick={onClick}
			value={value}
		/>
	);
};

const BaseProps = ({ definitions, instance }) => {
	const [expandedDefinitionId, setExpandedDefinition] = React.useState('');

	const toggleExpanded = (definitionId) =>
		setExpandedDefinition(expandedDefinitionId === definitionId ? -1 : definitionId);

	const rows = chunk(definitions, 2);

	const { getInstanceDefinitionValue, setInstanceDefinitionValue } = AnimationStore.use();

	return (
		<div>
			{rows.map(([definition1, definition2]) => (
				<React.Fragment key={definition1.id}>
					{/* ROW */}
					<Box display="flex">
						<EditButton
							definition={definition1}
							isToggled={expandedDefinitionId === definition1.id}
							onClick={() => toggleExpanded(definition1.id)}
							instance={instance}
						/>
						{definition2 && (
							<EditButton
								definition={definition2}
								isToggled={expandedDefinitionId === definition2.id}
								onClick={() => toggleExpanded(definition2.id)}
								instance={instance}
							/>
						)}
					</Box>

					{/* VALUE EDITOR */}
					{(expandedDefinitionId === definition1.id ||
						(definition2 && expandedDefinitionId === definition2.id)) && (
						<ValueEditor
							definitionId={expandedDefinitionId}
							value={getInstanceDefinitionValue(instance.id, expandedDefinitionId)}
							onChange={(value) =>
								setInstanceDefinitionValue(instance.id, expandedDefinitionId, value)
							}
						/>
					)}
				</React.Fragment>
			))}
		</div>
	);
};

export default BaseProps;

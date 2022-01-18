import React from 'react';
import chunk from 'lodash/chunk';
import { AnimationStore, MediaStore, UIStore } from 'stores';
import { INTERVAL_MS } from 'utils/constants';
import { getAnimatedDefinitions, getInstanceDefinitions } from 'utils/definitions';
import { IconButton, Ticks, ValueButton, ValueEditor } from 'components/shared';
import CreateInstance from './CreateInstance';
import InstanceHead from './InstanceHead';

import styles from './InstanceEditor.module.css';

const EditButton = ({ definition, isToggled, onClick, instance }) => (
	<AnimationStore.Consumer>
		{({ setInstanceDefinitionValue, getInstanceDefinitionValue }) => (
			<ValueButton
				//canClear={false}
				accessory={
					<IconButton
						icon="close"
						onClick={() => setInstanceDefinitionValue(instance.id, definition.id, undefined)}
					/>
				}
				className={styles.definition}
				definition={definition}
				isToggled={isToggled}
				onClick={onClick}
				//onClear={() => setInstanceDefinitionValue(instance.id, definition.id, undefined)}
				value={getInstanceDefinitionValue(instance.id, definition.id)}
			/>
		)}
	</AnimationStore.Consumer>
);

const Definitions = ({ instance, definitions }) => {
	const [expandedDefinitionId, setExpandedDefinition] = React.useState('');

	const toggleExpanded = (definitionId) =>
		setExpandedDefinition(expandedDefinitionId === definitionId ? -1 : definitionId);

	const rows = chunk(definitions, 2);

	return (
		<div>
			{rows.map(([definition1, definition2]) => (
				<React.Fragment key={definition1.id}>
					<div className={styles.buttons}>
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
					</div>

					{(expandedDefinitionId === definition1.id ||
						(definition2 && expandedDefinitionId === definition2.id)) && (
						<AnimationStore.Consumer>
							{({ getInstanceDefinitionValue, setInstanceDefinitionValue }) => (
								<ValueEditor
									definitionId={expandedDefinitionId}
									value={getInstanceDefinitionValue(instance.id, expandedDefinitionId)}
									onChange={(value) =>
										setInstanceDefinitionValue(instance.id, expandedDefinitionId, value)
									}
								/>
							)}
						</AnimationStore.Consumer>
					)}
				</React.Fragment>
			))}
		</div>
	);
};

const Timeline = ({ duration = 100, delay = 0 }) => {
	const SPACING = 5;
	return (
		<MediaStore.Consumer>
			{({ playhead }) => (
				<>
					<Ticks.PixelSpaced
						max={duration / INTERVAL_MS}
						spacing={SPACING}
						ticks={[
							{
								mod: 20,
								height: 20,
								drawExtra: ({ ctx, index, x, y }) => {
									ctx.font = '12px "Helvetica Neue", sans-serif';
									const text = `${index / 100}`;
									const measured = ctx.measureText(text);
									ctx.fillText(text, x - measured.width / 2, y - 4);
								}
							},
							{ mod: 10, height: 10 },
							{ mod: 1, height: 5 }
						]}
					/>
					<div
						style={{
							position: 'absolute',
							backgroundColor: 'black',
							top: 0,
							width: 1,
							height: '100%',
							left: (playhead / INTERVAL_MS) * SPACING
						}}
					/>
				</>
			)}
		</MediaStore.Consumer>
	);
};

const Instance = ({ instance }) => {
	return (
		<UIStore.Consumer>
			{({ selectedInstanceId }) => (
				<div>
					<InstanceHead instance={instance} />
					{selectedInstanceId === instance.id && (
						<>
							<Definitions instance={instance} definitions={getInstanceDefinitions()} />
							<Definitions instance={instance} definitions={getAnimatedDefinitions()} />
							<div style={{ position: 'relative', height: 50 }}>
								<AnimationStore.Consumer>
									{({ getInstanceDefinitionValue }) => (
										<Timeline
											delay={getInstanceDefinitionValue(instance.id, 'animation-delay')}
											duration={getInstanceDefinitionValue(
												instance.id,
												'animation-duration'
											)}
										/>
									)}
								</AnimationStore.Consumer>
							</div>
						</>
					)}
				</div>
			)}
		</UIStore.Consumer>
	);
};

class InstanceEditor extends React.Component {
	state = {
		expandedDefinitionId: ''
	};

	render() {
		return (
			<div>
				<CreateInstance />
				<AnimationStore.Consumer>
					{({ getInstances }) => (
						<div>
							{getInstances().map((instance) => (
								<Instance key={instance.id} instance={instance} />
							))}
						</div>
					)}
				</AnimationStore.Consumer>
			</div>
		);
	}
}
export default InstanceEditor;

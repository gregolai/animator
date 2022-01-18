import React from 'react';
import { AnimationStore, UIStore } from 'stores';
import { AddDropdown, IconButton, ExpandingTitle } from 'components/shared';

import styles from './InstanceHead.module.scss';

const CloseButton = ({ instance }) => (
	<AnimationStore.Consumer>
		{({ deleteInstance }) => <IconButton icon="close" onClick={() => deleteInstance(instance.id)} />}
	</AnimationStore.Consumer>
);

const InstanceHead = ({ instance }) => (
	<UIStore.Consumer>
		{({ selectedInstanceId, setSelectedInstance }) => (
			<div className={styles.container}>
				<ExpandingTitle
					accessory={<CloseButton instance={instance} />}
					className={styles.title}
					isExpanded={selectedInstanceId === instance.id}
					label={instance.name}
					onClick={() => setSelectedInstance(instance.id)}
				/>

				<AnimationStore.Consumer>
					{({ setInstanceAnimation, getAnimation, getAnimations }) => (
						<AddDropdown
							icon="desktop"
							label="Animation"
							label2={getAnimation(instance.animId).name}
							options={getAnimations().map((anim) => ({
								label: anim.name,
								value: anim.id
							}))}
							onSelect={(animId) => {
								setInstanceAnimation(instance.id, animId);
							}}
							value={instance.animId}
						/>
					)}
				</AnimationStore.Consumer>
			</div>
		)}
	</UIStore.Consumer>
);
export default InstanceHead;

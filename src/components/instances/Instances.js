import { React, cx } from 'common';
import { Box } from 'pu2';

import { AnimationStore, UIStore } from 'stores';
import { StepperField } from 'components/core';
import { AddDropdown, Ticks } from 'components/shared';

import Controls from './Controls';
import InstanceTimeline from './InstanceTimeline';
import PlayheadCursor from './PlayheadCursor';

import styles from './Instances.module.scss';

const Instance = ({ instance }) => {
	const { selectedInstanceId } = UIStore.use();

	const isSelected = selectedInstanceId === instance.id;

	return (
		<Box
			ml="11px"
			display="flex"
			borderRadius="4px" /* $border-radius-px */
			py="11px"
			transition="all 200ms linear"
			backgroundColor={`rgba(255,255,255,${isSelected ? 1 : 0})`}
			boxShadow={`inset ${isSelected ? 6 : 0}px 0 0 0 black`}
		>
			<Controls className={styles.instanceControls} instance={instance} />
			<InstanceTimeline instance={instance} />
		</Box>
	);
};

const Head = () => {
	const { getAnimations, createInstance } = AnimationStore.use();
	const { setSelectedInstance, tickSpacing, setTickSpacing } = UIStore.use();

	const animations = getAnimations();

	return (
		<Box
			display="flex"
			backgroundColor="white" /* $color-bg-0 */
			borderBottom="1px solid #a1a1a1" /* $color-border-1 */
		>
			<div className={styles.headLeft}>
				{animations.length > 0 && (
					<AddDropdown
						className={styles.btnCreateInstance}
						label="Create Instance"
						options={animations.map((animation) => ({
							label: animation.name,
							value: animation.id
						}))}
						onSelect={(animationId) => {
							const instance = createInstance({ animationId });
							setSelectedInstance(instance.id);
						}}
					/>
				)}

				<StepperField
					flush
					underlined={false}
					className={styles.spacing}
					label="Spacing"
					min={2}
					max={20}
					onChange={setTickSpacing}
					step={1}
					value={tickSpacing}
				/>
			</div>
			<Box position="relative" flex="1">
				<Ticks.PixelSpaced
					spacing={tickSpacing}
					ticks={[
						{
							mod: 20,
							height: 20,
							color: '#a1a1a1',
							drawExtra: ({ ctx, index, x, y }) => {
								ctx.font = '12px "Helvetica Neue", sans-serif';
								const text = `${index / 100}s`;
								const measured = ctx.measureText(text);
								ctx.fillStyle = 'black';
								ctx.fillText(text, x - measured.width / 2, y - 4);
							}
						},
						{ mod: 10, color: '#a1a1a1', height: 10 },
						{ mod: 1, color: '#a1a1a1', height: 5 }
					]}
				/>
			</Box>
		</Box>
	);
};

const Instances = () => {
	const { getInstances } = AnimationStore.use();
	return (
		<Box position="relative" height="100%" display="flex" flexDirection="column">
			<Head />
			<Box position="relative" flex="1" overflowY="scroll">
				{/* BODY INNER */}
				<Box position="absolute" top="0px" left="0px" width="100%">
					{getInstances().map((instance) => (
						<Instance key={instance.id} instance={instance} />
					))}
					<PlayheadCursor />
				</Box>
			</Box>
		</Box>
	);
};
export default Instances;

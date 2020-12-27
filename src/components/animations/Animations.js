import { React, cx } from 'common';
import { Box } from 'pu2';
import { AnimationStore, UIStore } from 'stores';
import Animation from './Animation';

const Animations = () => {
	const { getAnimations } = AnimationStore.use();
	const { selectedInstanceId } = UIStore.use();
	return (
		<Box
			backgroundColor={selectedInstanceId !== -1 ? '#f2f2f2' : 'white'}
			flex="1"
			overflowY="scroll"
			overflowX="hidden"
			transition="background-color 200ms ease-in-out"
		>
			{getAnimations().map((animation) => (
				<Animation key={animation.id} animation={animation} />
			))}
		</Box>
	);
};
export default Animations;

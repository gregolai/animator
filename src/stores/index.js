import React from 'react';
import AnimationStore from './AnimationStore';
import ImporterStore from './ImporterStore';
import StageStore from './StageStore';
import UIStore from './UIStore';

export const withStores = Component => props => (
	<ImporterStore>
		<AnimationStore>
			<UIStore>
				<StageStore>
					<Component {...props} />
				</StageStore>
			</UIStore>
		</AnimationStore>
	</ImporterStore>
);

export { AnimationStore, ImporterStore, StageStore, UIStore };

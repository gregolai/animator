import React from 'react';
import SplitPane from 'react-split-pane';
// import cssbeautify from 'cssbeautify';

import { ButtonField } from 'components/core';
import { withStores, AnimationStore, UIStore, ImporterStore } from 'stores';
import { PlaybackController } from 'utils';

import Stage from './components/stage/Stage';
import Export from './components/export/Export';
import ImportCSSModal from './components/importer/ImportCSSModal';
import MediaControls from './components/media/MediaControls';

import Animations from './components/animations/Animations';
import Instances from './components/instances/Instances';

import { Box } from 'pu2';

// getCss = animations => {
//   const css = this.state.animations.map(anim => {
//     if (anim.tweens.length === 0) return '';

//     const percentGroups = {};

//     const pushTimestamp = (name, time, value) => {
//       const percent = Math.floor(time * 100);
//       (percentGroups[percent] = percentGroups[percent] || []).push({ name, value });
//     }

//     anim.tweens.forEach(tween => {
//       tween.keyframes.forEach(h => pushTimestamp(tween.cssName, h.time, h.value));
//     });

//     const sorted = Object.entries(percentGroups)
//       .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

//     const writeProp = ({ name, value }) => `${name}: ${value};`;

//     const writePercentGroup = (percent, group) => `${percent}% { ${group.map(writeProp).join(' ') } }`;

//     return `@keyframes anim_${anim.id} { ${sorted.map(([percent, group]) => writePercentGroup(percent, group)).join(' ') } }`;
//   }).join(' ');

//   return cssbeautify(css, {
//     indent: '  ',
//     autosemicolon: true
//   });
// }

const ImportButton = () => {
	const { setOpen } = ImporterStore.use();
	return (
		<Box flex="1">
			<ButtonField onClick={() => setOpen(true)} label="Import" />
		</Box>
	);
};

const AddAnimationButton = () => {
	const { createAnimation } = AnimationStore.use();
	return (
		<Box flex="1">
			<ButtonField label="Create Animation" onClick={() => createAnimation()} />
		</Box>
	);
};

const App = withStores(() => {
	const [debug, toggleDebug] = React.useState(true);
	const [showExportModal, setShowExportModal] = React.useState(false);

	const { getInstances, getInstanceDefinitionValue } = AnimationStore.use();

	const maxDuration = getInstances().reduce((max: any, instance: any) => {
		const delay = getInstanceDefinitionValue(instance.id, 'animationDelay');
		const duration = getInstanceDefinitionValue(instance.id, 'animationDuration');
		return Math.max(delay + duration, max);
	}, 0);

	return (
		<PlaybackController duration={maxDuration}>
			<Box backgroundColor="#f2f2f2" /* $color-bg-1 */ height="100vh" overflow="hidden">
				{/* DEBUG */}
				<label
					style={{
						userSelect: 'none',
						position: 'fixed',
						zIndex: 999,
						top: 0,
						left: 0
					}}
				>
					Debug <input type="checkbox" onChange={() => toggleDebug(!debug)} checked={debug} />
				</label>
				<button
					style={{
						userSelect: 'none',
						position: 'fixed',
						zIndex: 999,
						top: 20,
						left: 0
					}}
					onClick={() => {
						localStorage.clear();
						window.location.reload();
					}}
				>
					Reset Cache
				</button>

				{/* MODALS */}
				<ImportCSSModal />
				{showExportModal && <Export onRequestClose={() => setShowExportModal(false)} />}

				<SplitPane
					split="horizontal"
					minSize={300}
					maxSize={-300}
					defaultSize={window.innerHeight * 0.5}
				>
					{/* TOP REGION */}
					<SplitPane
						split="vertical"
						minSize={300}
						maxSize={1200}
						defaultSize={window.innerWidth * 0.5}
					>
						{/* TOP LEFT */}
						<Box display="flex" flexDirection="column">
							<Box display="flex">
								{/* IMPORT */}
								<ImportButton />

								{/* EXPORT */}
								<Box flex="1">
									<ButtonField onClick={() => setShowExportModal(true)} label="Export" />
								</Box>

								{/* ADD ANIMATION */}
								<AddAnimationButton />
							</Box>

							{/* KEYFRAME ANIMATIONS */}
							<Animations />
						</Box>

						{/* TOP RIGHT */}
						<Box display="flex" flexDirection="column">
							{/* STAGE */}
							<Stage />
							<MediaControls />
						</Box>
					</SplitPane>

					{/* BOTTOM REGION */}
					<Box display="flex" flexDirection="column" height="100%">
						{/* INSTANCE EDITING */}
						<Instances />
					</Box>
				</SplitPane>
			</Box>
		</PlaybackController>
	);
});

export default App;

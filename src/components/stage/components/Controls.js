import React from 'react';
import { Box } from 'pu2';
import { BooleanField, NumberField } from 'components/core';

import { StageStore } from 'stores';

export default () => {
	const { showGrid, setShowGrid, gridSnap, setGridSnap, gridSize, setGridSize } = StageStore.use();
	return (
		<Box position="absolute" right="0px" bottom="0px">
			{showGrid && (
				<>
					<BooleanField label="Snap To Grid" onChange={setGridSnap} value={gridSnap} />
					<NumberField label="Grid Size" min={8} max={88} onChange={setGridSize} value={gridSize} />
				</>
			)}
			<BooleanField label="Show Grid" onChange={setShowGrid} value={showGrid} />
		</Box>
	);
};

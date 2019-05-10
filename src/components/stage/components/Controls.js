import React from 'react';
import { BooleanField, NumberField } from 'components/core';

import { StageStore } from 'stores';

import styles from './Controls.module.scss';

export default () => {
  const { showGrid, setShowGrid, gridSnap, setGridSnap, gridSize, setGridSize } = StageStore.use();
  return (
    <div className={styles.container}>

      {showGrid && (
        <>
          <BooleanField
            label="Snap To Grid"
            onChange={setGridSnap}
            value={gridSnap}
          />
          <NumberField
            label="Grid Size"
            min={8}
            max={88}
            onChange={setGridSize}
            value={gridSize}
          />
        </>
      )}
      <BooleanField
        label="Show Grid"
        onChange={setShowGrid}
        value={showGrid}
      />
    </div>
  );
};

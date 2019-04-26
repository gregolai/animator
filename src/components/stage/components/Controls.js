import React from 'react';
import { BooleanField, ButtonField, NumberField } from 'components/core';

import { StageStore, UIStore } from 'stores';

import styles from './Controls.scss';

export default () => (
  <StageStore.Consumer>
    {({ showGrid, gridSize, setShowGrid, setGridSize }) => (
      <div className={styles.container}>
        <div className={styles.leftControls}>
          {/* NOTHING HERE? */}
        </div>

        <div className={styles.rightControls}>
          <BooleanField
            flush
            className={styles.showGrid}
            label="Show Grid"
            onChange={setShowGrid}
            value={showGrid}
          />
          <NumberField
            flush
            className={styles.gridSize}
            label="Grid Size"
            min={8}
            max={88}
            onChange={setGridSize}
            value={gridSize}
          />
        </div>
      </div>
    )}
  </StageStore.Consumer>
)
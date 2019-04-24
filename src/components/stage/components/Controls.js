import React from 'react';
import { BooleanField, ButtonField, NumberField } from 'components/core';

import { StageStore, UIStore } from 'stores';

import styles from './Controls.scss';

export default () => (
  <StageStore.Consumer>
    {({ showGrid, gridSize, setShowGrid, setGridSize }) => (
      <div className={styles.container}>
        <BooleanField
          className={styles.showGrid}
          label="Show Grid"
          onChange={setShowGrid}
          value={showGrid}
        />
        <NumberField
          className={styles.gridSize}
          label="Grid Size"
          min={8}
          max={88}
          onChange={setGridSize}
          value={gridSize}
        />
        <UIStore.Consumer>
          {({ selectedAnimId }) => (
            <StageStore.Consumer>
              {({ createInstance }) => (
                <ButtonField
                  inverted
                  className={styles.createInstance}
                  size="small"
                  isDisabled={selectedAnimId === -1}
                  label="Create Instance"
                  onClick={() => createInstance({ animId: selectedAnimId })}
                />
              )}
            </StageStore.Consumer>
          )}
        </UIStore.Consumer>

      </div>
    )}
  </StageStore.Consumer>
)
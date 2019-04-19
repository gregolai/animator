import React from 'react';
import classnames from 'classnames';
import BooleanField from '@sqs/core-components/fields/BooleanField';
import NumberField from '@sqs/core-components/fields/NumberField';

import StageStore from '../../../stores/StageStore';

import styles from './Controls.scss';

export default ({ className }) => (
  <StageStore.Consumer>
    {({ showGrid, gridSize, setShowGrid, setGridSize }) => (
      <div className={classnames(styles.container, className)}>
        <BooleanField
          label="Show Grid"
          onChange={setShowGrid}
          value={showGrid}
        />
        <NumberField
          label="Grid Size"
          min={8}
          max={88}
          onChange={setGridSize}
          value={gridSize}
        />
      </div>
    )}
  </StageStore.Consumer>
)
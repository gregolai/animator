import React from 'react';
import classnames from 'classnames';

import Canvas from '../shared/Canvas';

import Controls from './components/Controls';
import StageStore from '../../stores/StageStore';

import styles from './Stage.scss';

const GRID_COLOR = '#f2f2f2';

const StageCanvas = () => (
  <StageStore.Consumer>
    {({ gridSize, showGrid }) => (
      <Canvas
        onResize={({ cvs, ctx }) => {
          ctx.clearRect(0, 0, cvs.width, cvs.height);
          if (!showGrid) return;

          const width = cvs.width;
          const height = cvs.height;

          /* eslint-disable no-lone-blocks */
          ctx.save();
          {
            ctx.beginPath();
            for (let x = gridSize; x <= width; x += gridSize) {
              ctx.moveTo(x + 0.5, 0);
              ctx.lineTo(x + 0.5, height);
            }

            for (let y = gridSize; y <= height; y += gridSize) {
              ctx.moveTo(0, y + 0.5);
              ctx.lineTo(width, y + 0.5);
            }
            ctx.closePath();

            ctx.lineWidth = 1;
            ctx.strokeStyle = GRID_COLOR;
            ctx.stroke();
          }
          ctx.restore();
        }}
      />
    )}
  </StageStore.Consumer>
)

export default ({ children, className, showControls }) => (
  <div className={classnames(styles.container, className)}>
    <StageCanvas />
    {children}
    {showControls && <Controls />}
  </div>
);

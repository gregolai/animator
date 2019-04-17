import React from 'react';
import BooleanField from '@sqs/core-components/fields/BooleanField';
import NumberField from '@sqs/core-components/fields/NumberField';

import Canvas from './shared/Canvas';

import styles from './Stage.scss';

const LINE_WIDTH = 1;
const GRID_COLOR = '#f2f2f2';

export default class Stage extends React.Component {
  state = {
    gridSize: 22,
    showGrid: true,
  };

  drawGrid = ({ cvs, ctx }) => {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    const { gridSize } = this.state;
    
    const width = cvs.width;
    const height = cvs.height;
    
    const halfLineWidth = LINE_WIDTH / 2;

    /* eslint-disable no-lone-blocks */
    ctx.save();
    {
      ctx.beginPath();
      for (let x = gridSize; x <= width; x += gridSize) {
        ctx.moveTo(x + halfLineWidth, 0);
        ctx.lineTo(x + halfLineWidth, height);
      }

      for (let y = gridSize; y <= height; y += gridSize) {
        ctx.moveTo(0, y + halfLineWidth);
        ctx.lineTo(width, y + halfLineWidth);
      }
      ctx.closePath();

      ctx.lineWidth = LINE_WIDTH;
      ctx.strokeStyle = GRID_COLOR;
      ctx.stroke();
    }
    ctx.restore();
  }

  render() {
    const { gridSize, showGrid } = this.state;
    return (
      <div className={styles.container}>
        <Canvas onResize={this.drawGrid} />
        {this.props.children}
        <div className={styles.controls}>
          <BooleanField
            label="Show Grid"
            onChange={v => this.setState({ showGrid: v })}
            value={showGrid}
          />
          <NumberField
            label="Grid Size"
            min={8}
            max={88}
            onChange={v => this.setState({ gridSize: v })}
            value={gridSize}
          />
        </div>

      </div>
    )
  }
}
import React from 'react';
import BooleanField from '@sqs/core-components/fields/BooleanField';
import NumberField from '@sqs/core-components/fields/NumberField';

import styles from './Stage.scss';

const LINE_WIDTH = 1;
const GRID_COLOR = '#f2f2f2';

export default class Stage extends React.Component {
  state = {
    height: 0,
    width: 0,
    gridSize: 22,
    showGrid: true,
  };

  captureContainer = ref => {
    this.container = ref;
  }

  captureCvs = ref => {
    this.cvs = ref;
  }

  componentDidMount() {
    const observer = new ResizeObserver(els => {
      const { width, height } = els[0].contentRect;
      this.setState({ width, height });
    })
    observer.observe(this.container);
  }

  componentDidUpdate() {
    this.clearGrid();

    if (this.state.showGrid) {
      this.drawGrid();
    }
  }

  clearGrid() {
    const ctx = this.cvs.getContext('2d');
    ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
  }

  drawGrid() {
    const { gridSize } = this.state;
    
    const ctx = this.cvs.getContext('2d');
    const width = this.cvs.clientWidth;
    const height = this.cvs.clientHeight;
    
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
    const { width, height, gridSize, showGrid } = this.state;
    return (
      <div
        ref={this.captureContainer}
        className={styles.container}
      >
        <canvas
          ref={this.captureCvs}
          height={height}
          width={width}
        ></canvas>
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